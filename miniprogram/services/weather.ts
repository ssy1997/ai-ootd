/* ========================================
   天气服务 - Weather Service
   ======================================== */

import { callCloudFunctionSilent } from '../utils/cloud';
import type {
  CloudFunctionResponse,
  WeatherInfo
} from '../types/index';

/**
 * 获取用户位置（经纬度）
 * @returns 位置信息
 */
function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      highAccuracyExpireTime: 3000,
      success: (res) => {
        resolve({ latitude: res.latitude, longitude: res.longitude });
      },
      fail: (err) => {
        console.error('获取位置失败', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取当前天气信息（基于用户位置）
 * @returns 天气信息
 */
export async function getCurrentWeather(): Promise<WeatherInfo> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return await getWeatherByCity('北京');
    }

    const location = await getUserLocation();
    console.log('getCurrentWeather - coordinates:', location.latitude, location.longitude);

    const res = await callCloudFunctionSilent<WeatherInfo>('weather', {
      action: 'current',
      latitude: location.latitude,
      longitude: location.longitude
    });

    return res.data;
  } catch (err) {
    console.error('获取当前天气失败', err);
    const defaultCityWeather = await getWeatherByCity('北京');
    return defaultCityWeather;
  }
}

/**
 * 根据城市名称获取天气
 * @param cityName 城市名称
 * @returns 天气信息
 */
export async function getWeatherByCity(cityName: string): Promise<WeatherInfo> {
  const res = await callCloudFunctionSilent<WeatherInfo>('weather', {
    action: 'byCity',
    cityName
  });
  return res.data;
}

/**
 * 根据经纬度获取天气
 * @param latitude 纬度
 * @param longitude 经度
 * @returns 天气信息
 */
export async function getWeatherByLocation(
  latitude: number,
  longitude: number
): Promise<WeatherInfo> {
  const res = await callCloudFunctionSilent<WeatherInfo>('weather', {
    action: 'byLocation',
    latitude,
    longitude
  });
  return res.data;
}

/**
 * 获取天气预报

 * @param city 城市名称（可选，默认使用当前位置）
 * @param days 天数（默认1天）
 * @returns 天气预报数据
 */
export async function getWeatherForecast(
  city?: string,
  days: number = 1
): Promise<WeatherInfo[]> {
  const res = await callCloudFunctionSilent<WeatherInfo[]>('weather', {
    action: 'forecast',
    city,
    days
  });
  return res.data;
}

/**
 * 请求位置权限
 * @returns 是否授权成功
 */
export async function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    wx.getSetting({
      success: (setting) => {
        if (setting.authSetting['scope.userLocation']) {
          resolve(true);
        } else {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              resolve(true);
            },
            fail: () => {
              // 用户拒绝授权，引导到设置页
              wx.showModal({
                title: '位置权限',
                content: '需要获取位置信息以提供天气相关的穿搭建议',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (settingRes) => {
                        resolve(settingRes.authSetting['scope.userLocation'] === true);
                      },
                      fail: () => {
                        resolve(false);
                      }
                    });
                  } else {
                    resolve(false);
                  }
                }
              });
            }
          });
        }
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 根据天气获取穿搭建议
 * @param weather 天气信息
 * @returns 穿搭建议
 */
export function getClothingSuggestionByWeather(weather: WeatherInfo): {
  message: string;
  suitableSeasons: string[];
  tips: string[];
} {
  const { temp, condition } = weather;
  const tips: string[] = [];
  let message = '';
  const suitableSeasons: string[] = [];

  if (temp < 10) {
    message = '天气寒冷，建议多穿保暖衣物';
    suitableSeasons.push('winter');
    tips.push('建议穿厚外套、羽绒服', '可以搭配毛衣保暖');
  } else if (temp < 20) {
    message = '天气凉爽，适合穿薄外套';
    suitableSeasons.push('autumn');
    tips.push('可以穿风衣、针织衫', '内搭T恤或衬衫');
  } else if (temp < 28) {
    message = '天气舒适，可以穿轻薄衣物';
    suitableSeasons.push('spring');
    tips.push('适合穿长袖T恤、薄外套', '早晚温差大，注意保暖');
  } else {
    message = '天气炎热，建议穿清凉衣物';
    suitableSeasons.push('summer');
    tips.push('建议穿短袖、短裤', '选择透气性好的面料');
  }

  if (condition.includes('雨')) {
    tips.push('记得带雨具', '建议穿防水的鞋子');
  }

  if (condition.includes('雪')) {
    tips.push('注意防滑', '可以穿保暖防水的靴子');
  }

  return {
    message,
    suitableSeasons,
    tips
  };
}

/**
 * 判断是否适合室外活动
 * @param weather 天气信息
 * @returns 是否适合
 */
export function isSuitableForOutdoor(weather: WeatherInfo): boolean {
  const { condition } = weather;
  const badConditions = ['暴雨', '大雪', '大风', '台风'];
  return !badConditions.some(c => condition.includes(c));
}
