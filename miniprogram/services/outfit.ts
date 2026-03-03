/* ========================================
   搭配服务 - Outfit Service
   ======================================== */

import { callCloudFunction, callCloudFunctionSilent } from '../utils/cloud';
import type {
  CloudFunctionResponse,
  Outfit,
  GetOutfitHistoryParams,
  OutfitHistoryData,
  FeedbackData,
  GetRecommendationParams,
  WeatherInfo,
  CloudFunctionAction
} from '../types/index';

/**
 * 获取搭配推荐
 * @param params 推荐参数
 * @returns 推荐的搭配
 */
export async function getRecommendation(
  params?: GetRecommendationParams
): Promise<Outfit> {
  const res = await callCloudFunctionSilent<Outfit>('outfit', {
    action: 'recommend' as CloudFunctionAction,
    ...params
  });
  return res.data;
}

/**
 * 获取搭配历史列表
 * @param params 查询参数
 * @returns 搭配历史数据
 */
export async function getOutfitHistory(
  params?: GetOutfitHistoryParams
): Promise<OutfitHistoryData> {
  const res = await callCloudFunction<OutfitHistoryData>('outfit', {
    action: 'list' as CloudFunctionAction,
    ...params
  });
  return res.data;
}

/**
 * 根据ID获取搭配详情
 * @param id 搭配ID
 * @returns 搭配详情
 */
export async function getOutfitById(id: string): Promise<Outfit> {
  const res = await callCloudFunction<Outfit>('outfit', {
    action: 'get' as CloudFunctionAction,
    id
  });
  return res.data;
}

/**
 * 保存搭配（添加到历史）
 * @param outfit 搭配数据
 * @returns 保存的搭配
 */
export async function saveOutfit(outfit: Partial<Outfit>): Promise<Outfit> {
  const res = await callCloudFunction<Outfit>('outfit', {
    action: 'add' as CloudFunctionAction,
    ...outfit
  });
  return res.data;
}

/**
 * 更新搭配
 * @param id 搭配ID
 * @param data 更新数据
 * @returns 更新后的搭配
 */
export async function updateOutfit(
  id: string,
  data: Partial<Outfit>
): Promise<Outfit> {
  const res = await callCloudFunction<Outfit>('outfit', {
    action: 'update' as CloudFunctionAction,
    id,
    ...data
  });
  return res.data;
}

/**
 * 删除搭配
 * @param id 搭配ID
 */
export async function deleteOutfit(id: string): Promise<void> {
  await callCloudFunction<void>('outfit', {
    action: 'delete' as CloudFunctionAction,
    id
  });
}

/**
 * 统一发送反馈 (Wear, Favorite, Unfavorite, Like, Skip)
 * @param outfitId 搭配ID
 * @param type 行为类型
 * @returns 反馈结果 { inventoryUpdated, preferenceUpdated }
 */
export async function sendFeedback(outfitId: string, type: 'wear' | 'favorite' | 'unfavorite' | 'like' | 'skip'): Promise<{ inventoryUpdated: number, preferenceUpdated: boolean }> {
  const res = await callCloudFunction<{ inventoryUpdated: number, preferenceUpdated: boolean }>('outfit', {
    action: 'feedback' as CloudFunctionAction,
    outfitId,
    type
  });
  return res.data;
}

/**
 * 收藏搭配
 * @param outfitId 搭配ID
 */
export async function favoriteOutfit(outfitId: string): Promise<void> {
  await sendFeedback(outfitId, 'favorite');
}

/**
 * 取消收藏搭配
 * @param outfitId 搭配ID
 */
export async function unfavoriteOutfit(outfitId: string): Promise<void> {
  await sendFeedback(outfitId, 'unfavorite');
}

/**
 * 提交评分反馈
 * @param data 反馈数据
 */
export async function submitFeedback(data: FeedbackData): Promise<void> {
  await sendFeedback(data.outfitId, data.type as any);
}

/**
 * 兼容性保留：获取收藏的搭配列表
 * @returns 收藏的搭配列表
 */
export async function getFavoritedOutfits(): Promise<Outfit[]> {
  const res = await getOutfitHistory({ isFavorited: true });
  return res.list;
}

/**
 * 根据日期获取搭配历史
 * @param date 日期
 * @returns 当天的搭配
 */
export async function getOutfitByDate(date: Date): Promise<Outfit | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const res = await getOutfitHistory({
    startDate: startOfDay,
    endDate: endOfDay
  });

  return res.list.length > 0 ? res.list[0] : null;
}

/**
 * 根据心情获取推荐
 * @param mood 心情
 * @returns 推荐的搭配
 */
export async function getRecommendationByMood(mood: string): Promise<Outfit> {
  return getRecommendation({ mood: mood as any });
}

/**
 * 根据场合获取推荐
 * @param occasion 场合
 * @returns 推荐的搭配
 */
export async function getRecommendationByOccasion(occasion: string): Promise<Outfit> {
  return getRecommendation({ occasion: occasion as any });
}

/**
 * 根据天气获取推荐
 * @param weather 天气信息
 * @returns 推荐的搭配
 */
export async function getRecommendationByWeather(weather: WeatherInfo): Promise<Outfit> {
  return getRecommendation({ weather });
}
