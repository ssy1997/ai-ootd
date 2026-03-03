/* ========================================
   User 云函数 - index.js
   ======================================== */

const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 主函数入口
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  /**
   * 生产级 OpenID 提取策略:
   * 1. 优先从 wxContext 获取 (客户端直接调用)
   * 2. 其次从 event 获取 (云函数间调用手动传入)
   * 3. 最后从 userInfo 获取 (兼容旧版或特定触发器)
   */
  const openid = wxContext.OPENID || event.openid || (event.userInfo ? event.userInfo.openId : undefined)
  const { action } = event

  if (!openid) {
    console.error('[User云函数] 关键错误: 无法获取用户 OPENID', { event, wxContext })
    return {
      code: 403,
      message: '无法识别用户身份',
      data: null
    }
  }

  try {
    // 根据 action 分发到不同处理函数
    switch (action) {
      case 'getCurrent':
        return await getCurrentUser(openid)
      case 'ensure':
        return await ensureUser(openid)
      case 'update':
        return await updateUser(event, openid)
      case 'getPreference':
        return await getStylePreference(openid)
      case 'updatePreference':
        return await updateStylePreference(event, openid)
      case 'incrementPreference': // 新增：增量更新权重
        return await incrementPreferenceWeights(event, openid)
      case 'getStats':
        return await getUserStats(openid)
      default:
        return {
          code: 400,
          message: '无效的操作类型',
          data: null
        }
    }
  } catch (err) {
    console.error('云函数执行失败', err)
    return {
      code: 500,
      message: err.message || '服务器错误',
      data: null
    }
  }
}

/**
 * 获取当前用户信息
 */
async function getCurrentUser(openid) {
  try {
    const res = await db.collection('users').where({ openid }).get()

    if (res.data.length === 0) {
      // 用户不存在，自动创建
      return await ensureUser(openid)
    }

    return {
      code: 200,
      message: 'success',
      data: res.data[0]
    }
  } catch (err) {
    console.error('获取当前用户信息失败', err)
    // 如果集合不存在，创建默认用户信息
    return {
      code: 200,
      message: 'success (default)',
      data: {
        openid,
        nickName: '未设置昵称',
        avatarUrl: '',
        createdAt: new Date()
      }
    }
  }
}

/**
 * 确保用户存在，不存在则创建
 */
async function ensureUser(openid) {
  try {
    const res = await db.collection('users').where({ openid }).get()

    if (res.data.length > 0) {
      return {
        code: 200,
        message: '用户已存在',
        data: res.data[0]
      }
    }

    // 创建新用户
    const now = new Date()
    const addRes = await db.collection('users').add({
      data: {
        openid,
        createdAt: now
      }
    })

    // 获取刚创建的用户
    const userRes = await db.collection('users').doc(addRes._id).get()

    return {
      code: 200,
      message: '创建成功',
      data: userRes.data
    }
  } catch (err) {
    console.error('确保用户存在时出错', err)
    // 如果集合不存在，返回默认用户信息
    return {
      code: 200,
      message: 'success (default)',
      data: {
        openid,
        nickName: '未设置昵称',
        avatarUrl: '',
        createdAt: new Date()
      }
    }
  }
}

/**
 * 更新用户信息
 */
async function updateUser(event, openid) {
  const { avatarUrl, nickName } = event

  // 构建更新数据
  const updateData = {
    updatedAt: new Date()
  }

  if (avatarUrl !== undefined) {
    updateData.avatarUrl = avatarUrl
  }

  if (nickName !== undefined) {
    updateData.nickName = nickName
  }

  const res = await db.collection('users')
    .where({ openid })
    .update({
      data: updateData
    })

  if (res.stats.updated === 0) {
    // 用户不存在，创建新用户
    return await ensureUser(openid)
  }

  // 获取更新后的记录
  const userRes = await db.collection('users').where({ openid }).get()

  return {
    code: 200,
    message: '更新成功',
    data: userRes.data[0]
  }
}

/**
 * 获取风格偏好
 */
async function getStylePreference(openid) {
  const res = await db.collection('preferences').where({ openid }).get()

  if (res.data.length === 0) {
    // 偏好不存在，返回默认值
    return {
      code: 200,
      message: 'success',
      data: {
        openid,
        preferredColors: [],
        preferredStyles: [],
        preferredOccasions: [],
        moods: [],
        updatedAt: new Date()
      }
    }
  }

  return {
    code: 200,
    message: 'success',
    data: res.data[0]
  }
}

/**
 * 更新风格偏好
 */
async function updateStylePreference(event, openid) {
  const {
    preferredColors,
    preferredStyles,
    preferredOccasions,
    moods
  } = event

  const now = new Date()

  // 检查偏好是否存在
  const res = await db.collection('preferences').where({ openid }).get()

  if (res.data.length === 0) {
    // 不存在，创建新偏好
    const addRes = await db.collection('preferences').add({
      data: {
        openid,
        preferredColors: preferredColors || [],
        preferredStyles: preferredStyles || [],
        preferredOccasions: preferredOccasions || [],
        moods: moods || [],
        updatedAt: now
      }
    })

    const preferenceRes = await db.collection('preferences').doc(addRes._id).get()

    return {
      code: 200,
      message: '创建成功',
      data: preferenceRes.data
    }
  }

  // 存在，更新
  const updateData = {
    updatedAt: now
  }

  if (preferredColors !== undefined) {
    updateData.preferredColors = preferredColors
  }

  if (preferredStyles !== undefined) {
    updateData.preferredStyles = preferredStyles
  }

  if (preferredOccasions !== undefined) {
    updateData.preferredOccasions = preferredOccasions
  }

  if (moods !== undefined) {
    updateData.moods = moods
  }

  const updateRes = await db.collection('preferences')
    .where({ openid })
    .update({
      data: updateData
    })

  if (updateRes.stats.updated === 0) {
    return {
      code: 404,
      message: '偏好不存在',
      data: null
    }
  }

  // 获取更新后的记录
  const preferenceRes = await db.collection('preferences').where({ openid }).get()

  return {
    code: 200,
    message: '更新成功',
    data: preferenceRes.data[0]
  }
}

/**
 * 增量更新偏好权重 (用于数据闭环)
 */
async function incrementPreferenceWeights(event, openid) {
  const { features, weightDelta = 1 } = event

  if (!features || typeof features !== 'object') {
    return { code: 400, message: '无效特征数据' }
  }

  const now = new Date()
  
  try {
    let prefRes = await db.collection('preferences').where({ openid }).get()
    let prefData
    
    if (prefRes.data.length === 0) {
      const initialData = {
        openid,
        weights: { color: {}, style: {}, occasion: {} },
        preferredColors: [],
        preferredStyles: [],
        preferredOccasions: [],
        updatedAt: now
      }
      await db.collection('preferences').add({ data: initialData })
      prefData = initialData
    } else {
      prefData = prefRes.data[0]
    }

    const weights = prefData.weights || { color: {}, style: {}, occasion: {} }
    const { colors = [], styles = [], occasions = [] } = features

    colors.forEach(c => weights.color[c] = (weights.color[c] || 0) + weightDelta)
    styles.forEach(s => weights.style[s] = (weights.style[s] || 0) + weightDelta)
    occasions.forEach(o => weights.occasion[o] = (weights.occasion[o] || 0) + weightDelta)

    // 自动提炼摘要 (严格锁定 Top 3)
    const getTop = (obj) => Object.entries(obj)
      .filter(([_, val]) => val > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // 只取前 3 名
      .map(([name, score]) => ({ name, score }))

    const preferredColors = getTop(weights.color || {})
    const preferredStyles = getTop(weights.style || {})
    const preferredOccasions = getTop(weights.occasion || {})

    await db.collection('preferences').where({ openid }).update({
      data: {
        weights,
        preferredColors,
        preferredStyles,
        preferredOccasions,
        updatedAt: now
      }
    })

    return { 
      code: 200, 
      message: '权重更新并已同步摘要',
      data: { preferredColors, preferredStyles, preferredOccasions }
    }
  } catch (err) {
    console.error('[偏好学习] 失败:', err)
    return { code: 500, message: '数据库更新失败' }
  }
}

/**
 * 获取用户统计信息
 */
async function getUserStats(openid) {
  try {
    // 获取服饰总数
    const clothingCountRes = await db.collection('clothing')
      .where({ openid })
      .count()

    // 获取搭配总数
    const outfitCountRes = await db.collection('outfits')
      .where({ openid })
      .count()

    // 获取收藏总数
    const favoriteCountRes = await db.collection('outfits')
      .where({ openid, isFavorited: true })
      .count()

    // 获取闲置服饰数量（超过90天未使用）
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const idleCountRes = await db.collection('clothing')
      .where({
        openid,
        lastUsedAt: _.lt(ninetyDaysAgo)
      })
      .count()

    return {
      code: 200,
      message: 'success',
      data: {
        clothingCount: clothingCountRes.total,
        outfitCount: outfitCountRes.total,
        favoriteCount: favoriteCountRes.total,
        idleCount: idleCountRes.total
      }
    }
  } catch (err) {
    console.error('获取用户统计信息失败', err)
    // 如果集合不存在，返回默认值
    return {
      code: 200,
      message: 'success (default)',
      data: {
        clothingCount: 0,
        outfitCount: 0,
        favoriteCount: 0,
        idleCount: 0
      }
    }
  }
}
