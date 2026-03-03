/* ========================================
   用户服务 - User Service
   ======================================== */

import { callCloudFunction } from '../utils/cloud';
import type {
  CloudFunctionResponse,
  User,
  StylePreference,
  CloudFunctionAction
} from '../types/index';

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export async function getCurrentUser(): Promise<User> {
  const res = await callCloudFunction<User>('user', {
    action: 'getCurrent' as CloudFunctionAction
  });
  return res.data;
}

/**
 * 更新用户信息
 * @param data 更新数据
 * @returns 更新后的用户信息
 */
export async function updateUser(data: Partial<User>): Promise<User> {
  const res = await callCloudFunction<User>('user', {
    action: 'update' as CloudFunctionAction,
    ...data
  });
  return res.data;
}

/**
 * 更新用户头像
 * @param avatarUrl 头像URL
 * @returns 更新后的用户信息
 */
export async function updateAvatar(avatarUrl: string): Promise<User> {
  return updateUser({ avatarUrl });
}

/**
 * 更新用户昵称
 * @param nickName 昵称
 * @returns 更新后的用户信息
 */
export async function updateNickName(nickName: string): Promise<User> {
  return updateUser({ nickName });
}

/**
 * 获取风格偏好
 * @returns 风格偏好
 */
export async function getStylePreference(): Promise<StylePreference> {
  const res = await callCloudFunction<StylePreference>('user', {
    action: 'getPreference' as CloudFunctionAction
  });
  return res.data;
}

/**
 * 更新风格偏好
 * @param preference 偏好数据
 * @returns 更新后的风格偏好
 */
export async function updateStylePreference(
  preference: Partial<StylePreference>
): Promise<StylePreference> {
  const res = await callCloudFunction<StylePreference>('user', {
    action: 'updatePreference' as CloudFunctionAction,
    ...preference
  });
  return res.data;
}

/**
 * 更新偏爱颜色
 * @param colors 颜色数组
 * @returns 更新后的风格偏好
 */
export async function updatePreferredColors(colors: string[]): Promise<StylePreference> {
  return updateStylePreference({ preferredColors: colors });
}

/**
 * 更新偏爱风格
 * @param styles 风格数组
 * @returns 更新后的风格偏好
 */
export async function updatePreferredStyles(styles: string[]): Promise<StylePreference> {
  return updateStylePreference({ preferredStyles: styles });
}

/**
 * 更新偏爱场合
 * @param occasions 场合数组
 * @returns 更新后的风格偏好
 */
export async function updatePreferredOccasions(occasions: string[]): Promise<StylePreference> {
  return updateStylePreference({ preferredOccasions: occasions });
}

/**
 * 更新偏爱心情
 * @param moods 心情数组
 * @returns 更新后的风格偏好
 */
export async function updatePreferredMoods(moods: string[]): Promise<StylePreference> {
  return updateStylePreference({ moods: moods as any });
}

/**
 * 获取用户统计信息
 * * @returns 统计信息
 */
export async function getUserStats(): Promise<{
  clothingCount: number;
  outfitCount: number;
  favoriteCount: number;
  idleCount: number;
}> {
  const res = await callCloudFunction<any>('user', {
    action: 'getStats' as CloudFunctionAction
  });
  return res.data;
}

/**
 * 检查并创建用户（如果不存在）
 * @returns 用户信息
 */
export async function ensureUser(): Promise<User> {
  const res = await callCloudFunction<User>('user', {
    action: 'ensure' as CloudFunctionAction
  });
  return res.data;
}
