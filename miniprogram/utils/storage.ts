/* ========================================
   本地存储工具类 - Storage Utils
   ======================================== */

/**
 * 本地存储键名枚举
 */
export enum StorageKey {
  USER_INFO = 'userInfo',
  STYLE_PREFERENCE = 'stylePreference',
  LAST_CLOSET_CATEGORY = 'lastClosetCategory',
  LAST_FILTER = 'lastFilter',
  APP_THEME = 'appTheme',
  CHAT_HISTORY = 'chat_history',
  CHAT_DATE = 'chat_date',
  CHAT_MESSAGES = 'chat_messages',
}

/**
 * 设置本地存储
 * @param key 键名
 * @param value 值
 */
export function setStorage<T>(key: StorageKey | string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      wx.setStorageSync(key, value);
      resolve();
    } catch (err) {
      console.error('设置本地存储失败', err);
      reject(err);
    }
  });
}

/**
 * 获取本地存储
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值
 */
export function getStorage<T>(key: StorageKey | string, defaultValue?: T): T {
  try {
    const value = wx.getStorageSync(key);
    return value !== '' ? value : (defaultValue as T);
  } catch (err) {
    console.error('获取本地存储失败', err);
    return defaultValue as T;
  }
}

/**
 * 移除本地存储
 * @param key 键名
 */
export function removeStorage(key: StorageKey | string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      wx.removeStorageSync(key);
      resolve();
    } catch (err) {
      console.error('移除本地存储失败', err);
      reject(err);
    }
  });
}

/**
 * 清空本地存储
 */
export function clearStorage(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      wx.clearStorageSync();
      resolve();
    } catch (err) {
      console.error('清空本地存储失败', err);
      reject(err);
    }
  });
}

/**
 * 获取本地存储信息
 * @returns 存储信息
 */
export function getStorageInfo(): WechatMiniprogram.GetStorageInfoSyncOption {
  try {
    return wx.getStorageInfoSync();
  } catch (err) {
    console.error('获取存储信息失败', err);
    return { keys: [], currentSize: 0, limitSize: 0 };
  }
}

/**
 * 保存用户信息到本地
 * @param userInfo 用户信息
 */
export function saveUserInfo(userInfo: any): Promise<void> {
  return setStorage(StorageKey.USER_INFO, userInfo);
}

/**
 * 获取本地存储的用户信息
 * @returns 用户信息
 */
export function getUserInfo(): any {
  return getStorage(StorageKey.USER_INFO, null);
}

/**
 * 清除用户信息
 */
export function clearUserInfo(): Promise<void> {
  return removeStorage(StorageKey.USER_INFO);
}

/**
 * 保存风格偏好
 * @param preference 风格偏好
 */
export function saveStylePreference(preference: any): Promise<void> {
  return setStorage(StorageKey.STYLE_PREFERENCE, preference);
}

/**
 * 获取本地存储的风格偏好
 * @returns 风格偏好
 */
export function getStylePreference(): any {
  return getStorage(StorageKey.STYLE_PREFERENCE, null);
}

/**
 * 保存上次筛选条件
 * @param filter 筛选条件
 */
export function saveLastFilter(filter: any): Promise<void> {
  return setStorage(StorageKey.LAST_FILTER, filter);
}

/**
 * 获取上次筛选条件
 * @returns 筛选条件
 */
export function getLastFilter(): any {
  return getStorage(StorageKey.LAST_FILTER, null);
}

interface ChatHistoryDay {
  date: string;
  messages: any[];
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 保存当天的对话消息
 */
export function saveTodayMessages(messages: any[]): void {
  setStorage(StorageKey.CHAT_MESSAGES, messages);
  setStorage(StorageKey.CHAT_DATE, getTodayDateString());
}

/**
 * 获取当天的对话消息（如果日期匹配）
 */
export function getTodayMessages(): any[] | null {
  const savedDate = getStorage<string>(StorageKey.CHAT_DATE, '');
  if (savedDate === getTodayDateString()) {
    return getStorage<any[]>(StorageKey.CHAT_MESSAGES, null);
  }
  return null;
}

/**
 * 获取存储的对话日期
 */
export function getChatDate(): string {
  return getStorage<string>(StorageKey.CHAT_DATE, '');
}

/**
 * 保存历史对话（将旧消息归档到历史，保留最近7天）
 */
export function saveChatHistory(date: string, messages: any[]): void {
  if (!messages || messages.length === 0) return;
  const history = getStorage<ChatHistoryDay[]>(StorageKey.CHAT_HISTORY, []);
  const existing = history.findIndex((h: ChatHistoryDay) => h.date === date);
  if (existing >= 0) {
    history[existing].messages = messages;
  } else {
    history.push({ date, messages });
  }
  history.sort((a: ChatHistoryDay, b: ChatHistoryDay) => b.date.localeCompare(a.date));
  const trimmed = history.slice(0, 7);
  setStorage(StorageKey.CHAT_HISTORY, trimmed);
}

/**
 * 获取所有历史对话（最近7天）
 */
export function getChatHistory(): ChatHistoryDay[] {
  return getStorage<ChatHistoryDay[]>(StorageKey.CHAT_HISTORY, []);
}
