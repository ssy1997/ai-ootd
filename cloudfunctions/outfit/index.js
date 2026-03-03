/* ========================================
   Outfit 云函数 - index.js (身份链修复版)
   ======================================== */

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

/**
 * 主入口
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // 核心：获取当前会话的 openid
  const openid = wxContext.OPENID || event.openid || (event.userInfo ? event.userInfo.openId : undefined)
  const { action } = event

  if (!openid) return { code: 403, message: '身份未识别' }

  try {
    switch (action) {
      case 'feedback': return await handleFeedback(event, openid)
      case 'favorite': return await handleFavorite(event, openid)
      case 'recommend': return await getRecommendation(event, openid)
      default: return { code: 400, message: '未知操作' }
    }
  } catch (err) {
    console.error('云函数执行异常', err)
    return { code: 500, message: err.message }
  }
}

/**
 * 处理用户反馈并同步更新偏好权重 (修复身份传递)
 */
async function handleFeedback(event, openid) {
  const { type, itemIds, weightDelta } = event
  if (!itemIds || !Array.isArray(itemIds)) {
    return { code: 400, message: '参数错误: 缺少 itemIds' }
  }

  try {
    const clothingRes = await db.collection('clothing').where({ _id: _.in(itemIds) }).get()
    const features = { colors: [], styles: [], occasions: [] }

    clothingRes.data.forEach(item => {
      if (item.color) features.colors.push(...(Array.isArray(item.color) ? item.color : [item.color]))
      if (item.style) features.styles.push(...(Array.isArray(item.style) ? item.style : [item.style]))
      if (item.occasion) features.occasions.push(...(Array.isArray(item.occasion) ? item.occasion : [item.occasion]))
    })

    if (type === 'like' || type === 'favorite' || type === 'wear') {
      const delta = weightDelta || (type === 'favorite' ? 3 : type === 'wear' ? 2 : 1)
      
      // 关键修复：显式传递 openid 建立身份链
      await cloud.callFunction({
        name: 'user',
        data: {
          action: 'incrementPreference',
          openid: openid, // 显式传递身份
          features: {
            colors: [...new Set(features.colors)],
            styles: [...new Set(features.styles)],
            occasions: [...new Set(features.occasions)]
          },
          weightDelta: delta
        }
      })
    }

    return { code: 200, message: '偏好已更新' }
  } catch (err) {
    console.error('偏好学习失败', err)
    return { code: 500, message: '偏好同步失败' }
  }
}

/**
 * 处理收藏 (修复身份传递)
 */
async function handleFavorite(event, openid) {
  const { itemIds } = event
  const now = new Date()
  
  try {
    await db.collection('outfits').add({
      data: { openid, itemIds, isFavorited: true, createdAt: now, updatedAt: now }
    })

    // 显式传递 openid 调用内部逻辑
    return await handleFeedback({ type: 'like', itemIds, weightDelta: 3 }, openid)
  } catch (err) {
    return { code: 500, message: '收藏失败' }
  }
}

async function getRecommendation() { return { code: 200, data: {} } }
