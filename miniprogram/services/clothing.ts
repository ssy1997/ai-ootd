/* ========================================
   服饰服务 - Clothing Service
   ======================================== */

import { callCloudFunction } from '../utils/cloud';
import type {
  CloudFunctionResponse,
  ClothingItem,
  GetClothingListParams,
  ClothingListData,
  AddClothingParams,
  UpdateClothingParams,
  CloudFunctionAction
} from '../types/index';

/**
 * 获取服饰列表
 * @param params 查询参数
 * @returns 服饰列表数据
 */
export async function getClothingList(
  params?: GetClothingListParams
): Promise<ClothingListData> {
  const res = await callCloudFunction<ClothingListData>('clothing', {
    action: 'list' as CloudFunctionAction,
    ...params
  });
  return res.data;
}

/**
 * 根据ID获取服饰详情
 * @param id 服饰ID
 * @returns 服饰详情
 */
export async function getClothingById(id: string): Promise<ClothingItem> {
  const res = await callCloudFunction<ClothingItem>('clothing', {
    action: 'get' as CloudFunctionAction,
    id
  });
  return res.data;
}

/**
 * 添加服饰
 * @param params 服饰参数
 * @returns 添加的服饰
 */
export async function addClothing(params: AddClothingParams): Promise<ClothingItem> {
  const res = await callCloudFunction<ClothingItem>('clothing', {
    action: 'add' as CloudFunctionAction,
    ...params
  });
  return res.data;
}

/**
 * 更新服饰
 * @param params 更新参数
 * @returns 更新后的服饰
 */
export async function updateClothing(params: UpdateClothingParams): Promise<ClothingItem> {
  const res = await callCloudFunction<ClothingItem>('clothing', {
    action: 'update' as CloudFunctionAction,
    ...params
  });
  return res.data;
}

/**
 * 删除服饰
 * @param id 服饰ID
 * @param imageUrl 图片URL（用于删除云存储文件）
 */
export async function deleteClothing(id: string, imageUrl?: string): Promise<void> {
  await callCloudFunction<void>('clothing', {
    action: 'delete' as CloudFunctionAction,
    id,
    imageUrl
  });
}

/**
 * 批量删除服饰
 * @param ids 服饰ID数组
 */
export async function batchDeleteClothing(ids: string[]): Promise<void> {
  await callCloudFunction<void>('clothing', {
    action: 'batchDelete' as CloudFunctionAction,
    ids
  });
}

/**
 * 标记服饰为已使用
 * @param id 服饰ID
 */
export async function markClothingUsed(id: string): Promise<ClothingItem> {
  const res = await callCloudFunction<ClothingItem>('clothing', {
    action: 'markUsed' as CloudFunctionAction,
    id
  });
  return res.data;
}

/**
 * 获取闲置服饰列表
 */
export async function getIdleClothing(): Promise<ClothingItem[]> {
  const res = await callCloudFunction<ClothingItem[]>('clothing', {
    action: 'getIdle' as CloudFunctionAction
  });
  return res.list;
}

/**
 * 根据品类获取服饰
 * @param category 品类
 * @returns 服饰列表
 */
export async function getClothingByCategory(
  category: string
): Promise<ClothingItem[]> {
  const res = await getClothingList({ category: category as any });
  return res.list;
}

/**
 * AI 识别服饰（调用 services/ai.ts）
 * @param imageUrl 图片URL
 * @returns AI识别结果数组
 */
export async function recognizeClothing(imageUrl: string): Promise<any[]> {
  // 调用 services/ai.ts 中的 recognizeClothing 函数
  const { recognizeClothing: recognizeClothingFromAI } = require('./ai');
  const res = await recognizeClothingFromAI(imageUrl);
  // 确保返回的是数组
  return Array.isArray(res) ? res : (res.data || []);
}

/**
 * 根据季节获取服饰
 * @param season 季节
 * @returns 服饰列表
 */
export async function getClothingBySeason(
  season: string
): Promise<ClothingItem[]> {
  const res = await getClothingList({ season: season as any });
  return res.list;
}
