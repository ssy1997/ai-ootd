/* ========================================
   Clothing 云函数 - index.js (全量动态汇总版)
   ======================================== */

const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

/**
 * 主函数入口
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || event.openid || (event.userInfo ? event.userInfo.openId : undefined)
  const { action } = event

  // 增加豁免：允许 migrateToChinese 和 resetStats 在无 openid 时执行（如云端控制台测试）
  const isAuthExempt = action === 'migrateToChinese' || action === 'resetStats';

  if (!openid && !isAuthExempt) {
    return { code: 403, message: '身份未识别' }
  }

  try {
    // 仅在非豁免操作且有 openid 时确保用户存在
    if (!isAuthExempt && openid) await ensureUser(openid)

    switch (action) {
      case 'list': return await getClothingList(event, openid)
      case 'batchAdd': return await batchAddClothing(event, openid)
      case 'get': return await getClothingById(event, openid)
      case 'add': return await addClothing(event, openid)
      case 'update': return await updateClothing(event, openid)
      case 'delete': return await deleteClothing(event, openid)
      case 'batchDelete': return await batchDeleteClothing(event, openid)
      case 'markUsed': return await markClothingUsed(event, openid)
      case 'getIdle': return await getIdleClothing(event, openid)
      case 'getSummary': return await getDashboardSummary(openid)
      case 'migrateToChinese': return await migrateToChinese(openid)
      case 'resetStats': return await resetAllStats(openid)
      default: return { code: 400, message: '无效的操作类型' }
    }
  } catch (err) {
    console.error('云函数执行异常', err)
    return { code: 500, message: err.message }
  }
}

/**
 * 数据重置脚本 (仅保留单品)
 */
async function resetAllStats(openid) {
  // 安全绕过：云端测试无 openid 时，使用 _id: _.exists(true) 匹配所有记录，防止 sdk 报错空查询
  const query = openid ? { openid } : { _id: _.exists(true) };
  
  try {
    // 1. 清空偏好档案
    await db.collection('preferences').where(query).remove();
    
    // 2. 清空穿搭记录与收藏
    await db.collection('outfits').where(query).remove();
    
    // 3. 重置单品统计数据 (使用次数归零，最后使用时间抹除)
    await db.collection('clothing').where(query).update({
      data: {
        useCount: 0,
        lastUsedAt: null,
        lastWornDate: null,
        updatedAt: new Date()
      }
    });

    return { code: 200, message: '数据已重置：偏好、历史已清空，单品统计已归零。' };
  } catch (err) {
    console.error('[重置失败]', err);
    return { code: 500, message: err.message };
  }
}

/**
 * 资产看板核心逻辑 - 返回全维度的复数形式字段
 */
async function getDashboardSummary(openid) {
  try {
    // 1. 基础总数
    const countRes = await db.collection('clothing').where({ openid }).count()
    const total = countRes.total || 0

    // 2. 利用率 (useCount > 0)
    const usedCountRes = await db.collection('clothing').where({ openid, useCount: _.gt(0) }).count()
    const utilization = total > 0 ? Math.round((usedCountRes.total / total) * 100) : 0

    // 3. 动态维度聚合 (全维度)
    const [catRes, occRes, colRes, styRes, matRes] = await Promise.all([
      db.collection('clothing').aggregate().match({ openid }).group({ _id: '$category' }).end(),
      db.collection('clothing').aggregate().match({ openid }).unwind({ path: '$occasion', preserveNullAndEmptyArrays: true }).group({ _id: '$occasion' }).end(),
      db.collection('clothing').aggregate().match({ openid }).unwind({ path: '$color', preserveNullAndEmptyArrays: true }).group({ _id: '$color' }).end(),
      db.collection('clothing').aggregate().match({ openid }).unwind({ path: '$style', preserveNullAndEmptyArrays: true }).group({ _id: '$style' }).end(),
      db.collection('clothing').aggregate().match({ openid }).unwind({ path: '$material', preserveNullAndEmptyArrays: true }).group({ _id: '$material' }).end()
    ])

    const extract = (res) => res.list.map(i => i._id).filter(v => v != null && v !== '')

    return {
      code: 200,
      data: {
        stats: { total, utilization },
        categories: extract(catRes), // 改回复数形式
        occasions: extract(occRes),
        colors: extract(colRes),
        styles: extract(styRes),
        materials: extract(matRes)
      }
    }
  } catch (err) {
    console.error('[看板统计] 失败', err)
    return { code: 200, data: { stats: { total: 0, utilization: 0 }, categories: [] } }
  }
}

/**
 * 业务逻辑保持稳定 (省略部分重复代码)...
 */
async function ensureUser(openid) {
  const res = await db.collection('users').where({ openid }).get()
  if (res.data.length === 0) await db.collection('users').add({ data: { openid, createdAt: new Date() } })
}

async function getClothingList(event, openid) {
  const { category, season, occasion, sortBy = 'createdAt', page = 1, pageSize = 20 } = event
  const whereCondition = { openid }
  if (category) whereCondition.category = category
  if (season) whereCondition.season = season
  if (occasion) whereCondition.occasion = occasion
  let query = db.collection('clothing').where(whereCondition)
  if (sortBy === 'useCount') query = query.orderBy('useCount', 'desc').orderBy('createdAt', 'desc')
  else query = query.orderBy('createdAt', 'desc')
  const countRes = await db.collection('clothing').where(whereCondition).count()
  const listRes = await query.skip((page - 1) * pageSize).limit(pageSize).get()
  return { code: 200, data: { list: listRes.data, total: countRes.total, hasMore: countRes.total > page * pageSize } }
}

async function batchAddClothing(event, openid) {
  const { items, imageUrl, createOutfit = false } = event
  const now = new Date(); const addedIds = []
  for (const item of items) {
    const res = await db.collection('clothing').add({ data: { openid, imageUrl, name: item.name, category: item.category, color: item.color || [], season: item.season || [], occasion: item.occasion || [], style: item.style || [], material: item.material || [], useCount: 0, isIdle: false, createdAt: now, updatedAt: now, lastWornDate: null } })
    addedIds.push(res._id)
  }
  if (createOutfit && addedIds.length > 0) {
    await db.collection('outfits').add({ data: { openid, itemIds: addedIds, isFavorited: true, reason: '批量录入自动生成的搭配', createdAt: now, updatedAt: now } })
  }
  return { code: 200, data: { ids: addedIds } }
}

async function getClothingById(event, openid) {
  const res = await db.collection('clothing').where({ _id: event.id, openid }).get()
  return res.data.length === 0 ? { code: 404 } : { code: 200, data: res.data[0] }
}

async function addClothing(event, openid) {
  const now = new Date()
  const res = await db.collection('clothing').add({ data: { openid, imageUrl: event.imageUrl, name: event.name, category: event.category, color: event.color || [], season: event.season || [], occasion: event.occasion || [], style: event.style || [], material: event.material || [], useCount: 0, isIdle: false, createdAt: now, updatedAt: now, lastWornDate: null } })
  return { code: 200, data: { _id: res._id } }
}

async function updateClothing(event, openid) {
  const updateData = { updatedAt: new Date() }
  if (event.name !== undefined) updateData.name = event.name
  if (event.category !== undefined) updateData.category = event.category
  if (event.season !== undefined) updateData.season = event.season
  if (event.occasion !== undefined) updateData.occasion = event.occasion
  await db.collection('clothing').where({ _id: event.id, openid }).update({ data: updateData })
  return { code: 200 }
}

async function deleteClothing(event, openid) {
  await db.collection('clothing').where({ _id: event.id, openid }).remove()
  if (event.imageUrl) await cloud.deleteFile({ fileList: [event.imageUrl] })
  return { code: 200 }
}

async function batchDeleteClothing(event, openid) {
  await db.collection('clothing').where({ _id: _.in(event.ids), openid }).remove()
  return { code: 200 }
}

async function markClothingUsed(event, openid) {
  const now = new Date()
  await db.collection('clothing').where({ _id: event.id, openid }).update({ data: { useCount: _.inc(1), lastUsedAt: now, isIdle: false, updatedAt: now, lastWornDate: now } })
  return { code: 200 }
}

async function getIdleClothing(event, openid) {
  const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const res = await db.collection('clothing').where({ openid, lastUsedAt: _.lt(ninetyDaysAgo) }).orderBy('lastUsedAt', 'asc').get()
  return { code: 200, data: res.data }
}

/**
 * 汉化清洗脚本 (生产级)
 * 作用：将存量的英文属性标签替换为中文，并同步修复偏好权重系统。
 */
async function migrateToChinese(openid) {
  const MAP = {
    // 类别
    'top': '上装', 'bottom': '下装', 'outer': '外套', 'shoes': '鞋履', 'accessory': '配饰', 'dress': '连衣裙',
    // 季节
    'spring': '春季', 'summer': '夏季', 'autumn': '秋季', 'winter': '冬季',
    // 场合
    'casual': '休闲', 'formal': '正式', 'sporty': '运动', 'work': '通勤', 'date': '约会',
    // 风格/颜色/款式
    'minimalist': '简约', 'vintage': '复古', 'streetwear': '街头', 'elegant': '优雅', 'sporty': '运动',
    'preppy': '学院', 'basic': '基础', 'chic': '时髦', 'commute': '通勤',
    'red': '红色', 'blue': '蓝色', 'white': '白色', 'black': '黑色', 'grey': '灰色', 'yellow': '黄色', 'green': '绿色'
  };

  const translate = (val) => {
    if (Array.isArray(val)) return val.map(v => MAP[v.toLowerCase()] || v);
    if (typeof val === 'string') return MAP[val.toLowerCase()] || val;
    return val;
  };

  try {
    const query = openid ? { openid } : {};
    
    // 1. 清洗 clothing 集合
    const clothingRes = await db.collection('clothing').where(query).limit(1000).get();
    for (const item of clothingRes.data) {
      const updateData = {
        category: translate(item.category),
        color: translate(item.color),
        season: translate(item.season),
        occasion: translate(item.occasion),
        style: translate(item.style),
        updatedAt: new Date()
      };
      await db.collection('clothing').doc(item._id).update({ data: updateData });
    }

    // 2. 清洗 preferences 集合 (修复风格分析显示英文的问题)
    const prefRes = await db.collection('preferences').where(query).limit(1000).get();
    for (const pref of prefRes.data) {
      if (!pref.weights) continue;
      
      const newWeights = { color: {}, style: {}, occasion: {} };
      
      // 合并权重：将英文 Key 的分数合并到中文 Key
      const merge = (oldObj, targetType) => {
        Object.entries(oldObj || {}).forEach(([key, val]) => {
          const chineseKey = MAP[key.toLowerCase()] || key;
          newWeights[targetType][chineseKey] = (newWeights[targetType][chineseKey] || 0) + val;
        });
      };

      merge(pref.weights.color, 'color');
      merge(pref.weights.style, 'style');
      merge(pref.weights.occasion, 'occasion');

      // 重新计算摘要 (Top 3)
      const getTop = (obj) => Object.entries(obj)
        .filter(([_, val]) => val > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, score]) => ({ name, score }));

      const preferredColors = getTop(newWeights.color).map(i => i.name);
      const preferredStyles = getTop(newWeights.style).map(i => i.name);
      const preferredOccasions = getTop(newWeights.occasion).map(i => i.name);

      await db.collection('preferences').doc(pref._id).update({
        data: { 
          weights: newWeights,
          preferredColors,
          preferredStyles,
          preferredOccasions,
          updatedAt: new Date()
        }
      });
    }

    return { code: 200, message: `汉化清洗成功：处理了 ${clothingRes.data.length} 件单品和 ${prefRes.data.length} 个偏好档案` };
  } catch (err) {
    console.error('[清洗失败]', err);
    return { code: 500, message: err.message };
  }
}
