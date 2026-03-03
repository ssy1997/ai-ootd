/* ========================================
   AI 云函数 - 动态进化版 (习惯学习 & 一图多存)
   ======================================== */

require('dotenv').config()
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const axios = require('axios')
const { sanitizeAIResponse, parseJSONSafely } = require('./utils')

const AI_CONFIG = {
  apiKey: process.env.ARK_API_KEY,
  baseUrl: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  model: process.env.AI_MODEL,
  visionModel: process.env.AI_VISION_MODEL || process.env.AI_MODEL
}

async function callArkAPI(messages, model = AI_CONFIG.model) {
  try {
    const res = await axios.post(`${AI_CONFIG.baseUrl}/chat/completions`, {
      model: model,
      temperature: 0.7,
      messages: messages
    }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_CONFIG.apiKey}` },
      timeout: 60000
    })
    return sanitizeAIResponse(res.data.choices[0].message.content)
  } catch (e) {
    console.error('[Ark API Error]', e.response?.data || e.message)
    throw new Error('AI服务连接失败')
  }
}

/**
 * AI 服饰识别 (多模态 - 动态标签归一化版)
 */
async function recognizeClothing(event, openid) {
  const { imageUrl, userLabels = {} } = event
  if (!imageUrl) return { code: 400, message: '缺少图片URL' }

  try {
    // 1. 地址桥接
    let httpsUrl = imageUrl
    if (imageUrl.startsWith('cloud://')) {
      const { fileList } = await cloud.getTempFileURL({ fileList: [imageUrl] })
      httpsUrl = fileList[0].tempFileURL
    }

    // 2. 构造动态 Prompt：融入用户已有的标签库
    const labelContext = `
用户衣橱中已有的标签库（请强制优先映射，严禁产生近义词）：
- 已有品类: ${userLabels.categories?.join(' / ') || '无'}
- 已有款式: ${userLabels.styles?.join(' / ') || '无'}
- 已有场合: ${userLabels.occasions?.join(' / ') || '无'}
- 已有材质: ${userLabels.materials?.join(' / ') || '无'}
`;

    const systemPrompt = `你是一个专业的时尚数据分析专家。请精准识别图中的所有单品服饰，并按照用户已有的打标习惯进行结构化输出。

【打标准则】：
1. 观察提供的“已有标签库”。如果图中单品属性与已有标签意思相近（如“长裤”与“裤子”），必须强制使用已有标签，严禁创建冗余词。
2. 只有当图中属性在已有库中完全无法匹配时，才允许生成新的专业中文标签。
3. 必须识别并拆分出图片中所有的独立单品（一图多存）。

【输出格式要求】：
必须且仅返回 JSON 数组格式，不要有任何解释文字。示例参考：
[
  {
    "category": "下装",
    "name": "深蓝直筒牛仔裤",
    "color": ["蓝色"],
    "style": ["直筒", "做旧"],
    "season": ["四季"],
    "occasion": ["休闲"],
    "material": ["丹宁"],
    "positionHint": "画面中心"
  }
]

${labelContext}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: '请根据我的标签习惯识别图中的服饰。' },
          { type: 'image_url', image_url: { url: httpsUrl } }
        ]
      }
    ]

    const aiRes = await callArkAPI(messages, AI_CONFIG.visionModel)
    const items = parseJSONSafely(aiRes)

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { code: 200, message: '未识别成功', data: [] }
    }

    return { code: 200, message: 'success', data: items }
  } catch (err) {
    console.error('[识图异常]', err)
    return { code: 500, message: '识别失败', data: [] }
  }
}

/**
 * AI 穿搭推荐
 */
async function handleChatRecommend(event, openid) {
  const { message, weather, history = [] } = event
  try {
    const clothingRes = await db.collection('clothing').where({ openid }).limit(100).get()
    const inventory = clothingRes.data.map(c => ({ id: c._id, name: c.name, color: c.color, style: c.style }))
    const systemPrompt = `时尚专家。环境:${JSON.stringify(weather)}。库存:${JSON.stringify(inventory)}。返回JSON:{"content":"点评","outfit":{"itemIds":[],"reason":""}}`
    const res = await callArkAPI([{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: message }])
    const parsed = parseJSONSafely(res)
    if (parsed && parsed.outfit) {
      parsed.outfit.items = clothingRes.data.filter(c => parsed.outfit.itemIds.includes(c._id))
    }
    return { code: 200, message: 'success', data: parsed }
  } catch (err) {
    return { code: 500, message: '推荐服务异常' }
  }
}

exports.main = async (event) => {
  const { action } = event
  const openid = (cloud.getWXContext()).OPENID || event.openid
  if (!openid) return { code: 403, message: '未识别身份' }
  switch (action) {
    case 'recognize': return await recognizeClothing(event, openid)
    case 'recommend': return await handleChatRecommend(event, openid)
    default: return { code: 400 }
  }
}
