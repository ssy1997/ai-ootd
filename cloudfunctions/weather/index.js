/* ========================================
   Weather 云函数 - index.js
   ======================================== */

const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// HTTP 请求函数（使用 axios）
const axios = require('axios')

async function httpGet(url) {
  try {
    const response = await axios.get(url)
    return { success: true, data: response.data }
  } catch (err) {
    console.error('HTTP请求失败', err)
    return { success: false, error: err }
  }
}

// 和风天气 API Key
const QWEATHER_API_KEY = '2b6ed4c0677f421986167ba5e5e771ab'
// 和风天气 API 基础 URL（使用自定义 host）
const QWEATHER_API_BASE = 'https://n32pg7q5wk.re.qweatherapi.com'

// 缓存配置
const CACHE_CONFIG = {
  duration: 30 * 60 * 1000, // 30分钟（毫秒）
  collectionName: 'weather_cache'
}

/**
 * 获取缓存的天气数据
 * @param {string} key - 缓存键
 * @returns {Object|null} - 缓存数据或null
 */
async function getCachedWeather(key) {
  try {
    const cacheRes = await db.collection(CACHE_CONFIG.collectionName)
      .where({ key: key })
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get()

    if (cacheRes.data.length === 0) {
      return null
    }

    const cache = cacheRes.data[0]
    const now = Date.now()
    const cacheAge = now - new Date(cache.updatedAt).getTime()

    // 检查缓存是否过期
    if (cacheAge > CACHE_CONFIG.duration) {
      console.log(`缓存已过期，key: ${key}, age: ${cacheAge}ms`)
      return null
    }

    console.log(`使用缓存数据，key: ${key}, age: ${cacheAge}ms`)
    return cache.data
  } catch (err) {
    console.error('获取缓存失败', err)
    return null
  }
}

/**
 * 设置缓存的天气数据
 * @param {string} key - 缓存键
 * @param {Object} data - 要缓存的数据
 */
async function setCachedWeather(key, data) {
  try {
    const now = new Date()

    // 检查是否已有缓存，有则更新
    const existingRes = await db.collection(CACHE_CONFIG.collectionName)
      .where({ key: key })
      .get()

    if (existingRes.data.length > 0) {
      // 更新现有缓存
      await db.collection(CACHE_CONFIG.collectionName)
        .doc(existingRes.data[0]._id)
        .update({
          data: {
            key: key,
            data: data,
            updatedAt: now
          }
        })
      console.log(`更新缓存，key: ${key}`)
    } else {
      // 添加新缓存
      await db.collection(CACHE_CONFIG.collectionName).add({
        data: {
          key: key,
          data: data,
          updatedAt: now
        }
      })
      console.log(`创建缓存，key: ${key}`)
    }

    // 清理过期缓存（保留最近100条）
    const allCache = await db.collection(CACHE_CONFIG.collectionName)
      .orderBy('updatedAt', 'desc')
      .get()

    if (allCache.data.length > 100) {
      const toDelete = allCache.data.slice(100)
      for (const item of toDelete) {
        await db.collection(CACHE_CONFIG.collectionName).doc(item._id).remove()
      }
      console.log(`清理了 ${toDelete.length} 条过期缓存`)
    }
  } catch (err) {
    console.error('设置缓存失败', err)
  }
}

/**
 * 清理所有过期缓存
 */
async function cleanExpiredCache() {
  try {
    const now = Date.now()
    const expireTime = new Date(now - CACHE_CONFIG.duration)

    const expiredRes = await db.collection(CACHE_CONFIG.collectionName)
      .where({
        updatedAt: _.lt(expireTime)
      })
      .get()

    if (expiredRes.data.length > 0) {
      for (const item of expiredRes.data) {
        await db.collection(CACHE_CONFIG.collectionName).doc(item._id).remove()
      }
      console.log(`清理了 ${expiredRes.data.length} 条过期缓存`)
    }
  } catch (err) {
    console.error('清理过期缓存失败', err)
  }
}

/**
 * 主函数入口
 */
exports.main = async (event, context) => {
  const { action } = event

  try {
    // 清理过期缓存（每次调用时执行一次，减少数据库压力）
    await cleanExpiredCache()

    // 根据 action 分发到不同处理函数
    switch (action) {
      case 'current':
        return await getCurrentWeather(event)
      case 'byCity':
        return await getWeatherByCity(event)
      case 'byLocation':
        return await getWeatherByLocation(event)
      case 'forecast':
        return await getWeatherForecast(event)
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
 * 获取当前天气（基于用户位置）
 */
async function getCurrentWeather(event) {
  const { latitude, longitude } = event

  if (!latitude || !longitude) {
    return {
      code: 400,
      message: '缺少位置信息',
      data: null
    }
  }

  return await getWeatherByLocation({ latitude, longitude })
}

/**
 * 根据城市名称获取天气
 */
async function getWeatherByCity(event) {
  const { cityName } = event

  // 验证参数
  if (!cityName || typeof cityName !== 'string') {
    return {
      code: 400,
      message: '城市名称无效',
      data: null
    }
  }

  if (cityName.length > 50) {
    return {
      code: 400,
      message: '城市名称过长（最多50字符）',
      data: null
    }
  }

  // 生成缓存键
  const cacheKey = `city_${cityName}`

  // 尝试从缓存获取
  const cachedData = await getCachedWeather(cacheKey)
  if (cachedData) {
    return {
      code: 200,
      message: 'success (cached)',
      data: cachedData
    }
  }

  try {
    // 步骤1：通过 GeoAPI 查询城市，获取 Location ID
    const cityLookupUrl = `${QWEATHER_API_BASE}/geo/v2/city/lookup?location=${encodeURIComponent(cityName)}&key=${QWEATHER_API_KEY}`

    console.log('城市查询请求:', cityLookupUrl)

    const cityResult = await httpGet(cityLookupUrl)
    if (!cityResult.success) {
      throw new Error('城市查询失败: ' + JSON.stringify(cityResult.error))
    }

    const cityData = cityResult.data
    console.log('城市查询响应:', cityData)

    if (cityData.code !== '200' || !cityData.location || cityData.location.length === 0) {
      return {
        code: 400,
        message: '未找到城市: ' + cityName,
        data: null
      }
    }

    const locationInfo = cityData.location[0]
    const locationId = locationInfo.id
    const locName = locationInfo.name || ''
    const locAdm2 = locationInfo.adm2 || ''

    // 拼接城市名称：市+区/县（当 name 与 adm2 不同时）
    let finalCityName = locName || cityName
    if (locAdm2 && locName && locAdm2 !== locName) {
      finalCityName = `${locAdm2} ${locName}`
    }

    console.log('Location ID:', locationId, '城市名称:', finalCityName, '(name:', locName, ', adm2:', locAdm2, ')')

    // 步骤2：使用 Location ID 查询实时天气
    const weatherUrl = `${QWEATHER_API_BASE}/v7/weather/now?location=${locationId}&key=${QWEATHER_API_KEY}`

    const result = await httpGet(weatherUrl)
    if (!result.success) {
      throw new Error('天气查询失败: ' + JSON.stringify(result.error))
    }

    const data = result.data
    console.log('天气API响应:', data)

    if (data.code !== '200') {
      return {
        code: 400,
        message: '获取天气失败: ' + (data.message || '未知错误'),
        data: null
      }
    }

    const weather = data.now

    const weatherData = {
      temp: parseInt(weather.temp) || 0,
      condition: weather.text,
      humidity: parseInt(weather.humidity) || 0,
      wind: `${windDirToText(weather.windDir)} ${windScaleToText(weather.windScale)}`,
      conditionCode: weather.icon ? parseInt(weather.icon) : 0,
      cityName: finalCityName
    }

    console.log('返回的天气数据:', weatherData)

    // 缓存结果
    await setCachedWeather(cacheKey, weatherData)

    return {
      code: 200,
      message: 'success',
      data: weatherData
    }
  } catch (err) {
    console.error('获取天气失败', err)
    return {
      code: 500,
      message: '获取天气失败: ' + (err.message || '未知错误'),
      data: null
    }
  }
}

/**
 * 根据经纬度获取天气（使用城市查询 API 获取 Location ID）
 */
async function getWeatherByLocation(event) {
  const { latitude, longitude } = event

  // 验证参数
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return {
      code: 400,
      message: '位置参数无效',
      data: null
    }
  }

  // 验证纬度范围（-90 ~ 90）
  if (latitude < -90 || latitude > 90) {
    return {
      code: 400,
      message: '纬度超出有效范围（-90 ~ 90）',
      data: null
    }
  }

  // 验证经度范围（-180 ~ 180）
  if (longitude < -180 || longitude > 180) {
    return {
      code: 400,
      message: '经度超出有效范围（-180 ~ 180）',
      data: null
    }
  }

  // 生成缓存键（保留4位小数，减少缓存碰撞）
  const latFixed = latitude.toFixed(4)
  const lonFixed = longitude.toFixed(4)
  const cacheKey = `loc_${latFixed}_${lonFixed}`

  // 尝试从缓存获取
  const cachedData = await getCachedWeather(cacheKey)
  if (cachedData) {
    return {
      code: 200,
      message: 'success (cached)',
      data: cachedData
    }
  }

  try {
    // 步骤1：用经纬度查询城市信息，获取 Location ID
    const location = `${longitude},${latitude}`
    const cityLookupUrl = `${QWEATHER_API_BASE}/geo/v2/city/lookup?location=${location}&key=${QWEATHER_API_KEY}`

    console.log('和风天气城市查询请求:', { latitude, longitude, url: cityLookupUrl })

    const cityLookupResult = await httpGet(cityLookupUrl)
    if (!cityLookupResult.success) {
      throw new Error('城市查询失败: ' + JSON.stringify(cityLookupResult.error))
    }

    const cityData = cityLookupResult.data
    console.log('城市查询响应:', cityData)

    if (cityData.code !== '200') {
      throw new Error('城市查询失败: code ' + cityData.code + ', message: ' + (cityData.message || ''))
    }

    // 步骤2：从响应中获取 Location ID 和城市名称
    const locationInfo = cityData.location && cityData.location[0]
    if (!locationInfo) {
      throw new Error('无法从城市查询响应中获取位置信息')
    }

    const locationId = locationInfo.id || locationInfo.name
    const locName = locationInfo.name || ''
    const locAdm2 = locationInfo.adm2 || ''

    // 拼接城市名称：市+区/县（当 name 与 adm2 不同时）
    let locationName = locName
    if (locAdm2 && locName && locAdm2 !== locName) {
      locationName = `${locAdm2} ${locName}`
    }

    console.log('获取到的 Location ID:', locationId)
    console.log('获取到的城市名称:', locationName, '(name:', locName, ', adm2:', locAdm2, ')')

    // 步骤3：使用 Location ID 查询天气
    const weatherUrl = `${QWEATHER_API_BASE}/v7/weather/now?location=${locationId}&key=${QWEATHER_API_KEY}`

    console.log('和风天气查询请求:', { locationId, url: weatherUrl })

    const result = await httpGet(weatherUrl)
    if (!result.success) {
      throw new Error('天气查询失败: ' + JSON.stringify(result.error))
    }

    const data = result.data
    console.log('和风天气响应:', data)

    if (data.code !== '200') {
      return {
        code: 400,
        message: '获取天气失败: ' + (data.message || '未知错误'),
        data: null
      }
    }

    const weather = data.now

    const weatherData = {
      temp: parseInt(weather.temp) || 0,
      condition: weather.text,
      humidity: parseInt(weather.humidity) || 0,
      wind: `${windDirToText(weather.windDir)} ${windScaleToText(weather.windScale)}`,
      conditionCode: weather.icon ? parseInt(weather.icon) : 0,
      cityName: locationName
    }

    console.log('返回的天气数据:', weatherData)

    // 缓存结果
    await setCachedWeather(cacheKey, weatherData)

    return {
      code: 200,
      message: 'success',
      data: weatherData
    }
  } catch (err) {
    console.error('获取天气失败', err)
    return {
      code: 500,
      message: '获取天气失败: ' + (err.message || '未知错误'),
      data: null
    }
  }
}

/**
 * 获取天气预报
 */
async function getWeatherForecast(event) {
  const { city, latitude, longitude, days = 1 } = event

  try {
    // 构建位置参数
    let location
    if (city) {
      location = city
    } else if (latitude && longitude) {
      location = `${longitude},${latitude}`
    } else {
      return {
        code: 400,
        message: '缺少位置信息',
        data: null
      }
    }

    // 调用和风天气 API - 7天预报
    const url = `${QWEATHER_API_BASE}/v7/weather/7d?location=${encodeURIComponent(location)}&key=${QWEATHER_API_KEY}`

    const result = await httpGet(url)
    if (!result.success) {
      throw new Error('API请求失败: ' + JSON.stringify(result.error))
    }
    const data = result.data

    if (data.code !== '200') {
      return {
        code: 400,
        message: '获取天气预报失败: ' + (data.message || '未知错误'),
        data: null
      }
    }

    const dailyForecast = data.daily || []
    // 根据天数参数截取预报数据
    const limitedForecast = dailyForecast.slice(0, days)
    const forecastData = limitedForecast.map((day) => ({
      temp: day.tempMax,
      condition: day.textDay,
      humidity: day.humidity,
      wind: `${windDirToText(day.windDirDay)} ${windScaleToText(day.windScaleDay)}`,
      conditionCode: day.iconDay ? parseInt(day.iconDay) : 0
    }))

    return {
      code: 200,
      message: 'success',
      data: forecastData
    }
  } catch (err) {
    console.error('获取天气预报失败', err)

    // 返回 Mock 数据
    const mockData = []
    for (let i = 0; i < days; i++) {
      mockData.push({
        temp: 25 + i,
        condition: '晴',
        humidity: 65,
        wind: '东风 2级',
        conditionCode: 100
      })
    }

    return {
      code: 200,
      message: 'success (mock)',
      data: mockData
    }
  }
}

/**
 * 风向代码转文本
 */
function windDirToText(code) {
  const dirMap = {
    '0': '无持续风向',
    'N': '北风',
    'NE': '东北风',
    'E': '东风',
    'SE': '东南风',
    'S': '南风',
    'SW': '西南风',
    'W': '西风',
    'NW': '西北风'
  }
  return dirMap[code] || code
}

/**
 * 风力等级转文本
 */
function windScaleToText(scale) {
  const scaleMap = {
    '0': '无风',
    '1': '软风',
    '2': '轻风',
    '3': '微风',
    '4': '和风',
    '5': '劲风',
    '6': '强风',
    '7': '疾风',
    '8': '大风',
    '9': '烈风',
    '10': '狂风',
    '11': '暴风',
    '12': '飓风'
  }
  return scaleMap[scale] || scale + '级'
}
