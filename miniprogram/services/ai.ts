/* ========================================
   AI 服务 - AI Service
   ======================================== */

import { callCloudFunction, callCloudFunctionSilent } from '../utils/cloud';
import type {
  CloudFunctionResponse,
  CloudFunctionAction
} from '../types/index';

/**
 * AI 对话接口
 * @param message 用户消息
 * @param context 对话上下文
 * @returns AI 响应
 */
export async function chatWithAI(
  message: string,
  context?: any
): Promise<{
  response: string;
  outfit?: any;
  suggestions?: string[];
}> {
  const res = await callCloudFunction<any>('ai', {
    action: 'chat' as CloudFunctionAction,
    message,
    context
  });
  return res.data;
}

/**
 * AI 服饰识别
 * @param imageUrl 图片URL
 * @returns 识别结果
 */
export async function recognizeClothing(imageUrl: string): Promise<{
  category: string;
  colors: string[];
  style: string[];
  confidence: number;
}> {
  const res = await callCloudFunction<any>('ai', {
    action: 'recognize' as CloudFunctionAction,
    imageUrl
  });
  return res.data;
}

/**
 * AI 搭配推荐
 * @param params 推荐参数
 * @returns 推荐结果
 */
export async function recommendOutfit(params: {
  mood?: string;
  occasion?: string;
  weather?: any;
  preferences?: any;
}): Promise<{
  outfit: any;
  reason: string;
  tips?: string[];
}> {
  const res = await callCloudFunction<any>('ai', {
    action: 'recommend' as CloudFunctionAction,
    ...params
  });
  return res.data;
}

/**
 * AI 风格分析
 * @param clothingItems 服饰列表
 * @returns 风格分析结果
 */
export async function analyzeStyle(clothingItems: any[]): Promise<{
  dominantStyle: string;
  styleDistribution: Record<string, number>;
  suggestions: string[];
}> {
  const res = await callCloudFunction<any>('ai', {
    action: 'analyze' as CloudFunctionAction,
    clothingItems
  });
  return res.data;
}

/**
 * AI 生成搭配建议
 * @param params 参数
 * @returns 搭配建议
 */
export async function generateOutfitSuggestion(params: {
  existingItems?: any[];
  targetCategory?: string;
  context?: any;
}): Promise<{
  suggestions: any[];
  reason: string;
}> {
  const res = await callCloudFunction<any>('ai', {
    action: 'suggest' as CloudFunctionAction,
    ...params
  });
  return res.data;
}

/**
 * AI 生成对话回复
 * @param userMessage 用户消息
 * @param conversationHistory 对话历史
 * @returns AI 回复
 */
export async function generateAIReply(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<{
  reply: string;
  suggestions?: string[];
  action?: string;
  actionData?: any;
}> {
  const res = await callCloudFunctionSilent<any>('ai', {
    action: 'reply' as CloudFunctionAction,
    userMessage,
    conversationHistory
  });
  return res.data;
}
