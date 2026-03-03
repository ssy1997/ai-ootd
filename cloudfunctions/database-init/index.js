// 云数据库初始化云函数
// 用于自动创建数据库集合和索引

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

/**
 * 数据库集合定义
 */
const collections = {
  users: {
    description: '用户表',
    indexes: [
      { fields: ['openid'], unique: true }
    ]
  },
  clothing: {
    description: '服饰表',
    indexes: [
      { fields: ['openid'] },
      { fields: ['category'] },
      { fields: ['season'] },
      { fields: ['occasion'] },
      { fields: ['openid', 'category'] }
    ]
  },
  outfits: {
    description: '搭配表',
    indexes: [
      { fields: ['openid'] },
      { fields: ['isFavorited'] },
      { fields: ['createdAt'] },
      { fields: ['openid', 'isFavorited'] }
    ]
  },
  preferences: {
    description: '风格偏好表',
    indexes: [
      { fields: ['openid'], unique: true }
    ]
  },
  history: {
    description: '操作历史表',
    indexes: [
      { fields: ['openid'] },
      { fields: ['createdAt'] }
    ]
  }
}

/**
 * 创建集合（通过添加一条临时数据并删除来创建）
 */
async function createCollection(name, description) {
  try {
    // 尝试添加一条临时数据来创建集合
    await db.collection(name).add({
      data: {
        _temp: true,
        createdAt: new Date()
      }
    })

    // 删除临时数据
    const tempRes = await db.collection(name).where({ _temp: true }).get()
    if (tempRes.data.length > 0) {
      await db.collection(name).doc(tempRes.data[0]._id).remove()
    }

    return { success: true, message: `集合 ${name} 创建成功` }
  } catch (err) {
    // 如果集合已存在，不算错误
    if (err.errCode === -502005) {
      return { success: true, message: `集合 ${name} 已存在` }
    }
    return { success: false, message: `集合 ${name} 创建失败: ${err.errMsg}` }
  }
}

/**
 * 验证集合是否存在
 */
async function checkCollectionExists(name) {
  try {
    await db.collection(name).limit(1).get()
    return true
  } catch (err) {
    return false
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { action = 'init' } = event
  const results = []
  const errors = []

  if (action === 'init') {
    // 初始化所有集合
    for (const [name, config] of Object.entries(collections)) {
      console.log(`正在初始化集合: ${name}`)
      const result = await createCollection(name, config.description)

      if (result.success) {
        results.push({
          collection: name,
          status: 'success',
          message: result.message
        })
        console.log(result.message)
      } else {
        errors.push({
          collection: name,
          status: 'failed',
          message: result.message
        })
        console.error(result.message)
      }
    }

    return {
      code: errors.length > 0 ? 500 : 200,
      message: errors.length > 0 ? '部分集合初始化失败' : '所有集合初始化成功',
      data: {
        results,
        errors,
        summary: {
          total: Object.keys(collections).length,
          success: results.length,
          failed: errors.length
        }
      }
    }
  }

  if (action === 'check') {
    // 检查所有集合状态
    for (const [name, config] of Object.entries(collections)) {
      const exists = await checkCollectionExists(name)
      results.push({
        collection: name,
        exists,
        description: config.description
      })
    }

    return {
      code: 200,
      message: '集合状态检查完成',
      data: {
        results,
        summary: {
          total: results.length,
          exists: results.filter(r => r.exists).length,
          missing: results.filter(r => !r.exists).length
        }
      }
    }
  }

  if (action === 'info') {
    // 返回配置信息
    return {
      code: 200,
      message: '数据库配置信息',
      data: {
        collections: Object.keys(collections).map(name => ({
          name,
          ...collections[name]
        }))
      }
    }
  }

  return {
    code: 400,
    message: '未知的操作类型',
    data: {
      validActions: ['init', 'check', 'info']
    }
  }
}
