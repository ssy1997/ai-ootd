/* ========================================
   通用工具类 - Common Utils
   ======================================== */

/**
 * 格式化时间
 * @param date 日期对象或时间戳
 * @param format 格式化模板，默认 'YYYY/MM/DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTime(
  date: Date | number | string,
  format: string = 'YYYY/MM/DD HH:mm:ss'
): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  return format
    .replace('YYYY', year.toString())
    .replace('MM', formatNumber(month))
    .replace('DD', formatNumber(day))
    .replace('HH', formatNumber(hour))
    .replace('mm', formatNumber(minute))
    .replace('ss', formatNumber(second));
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | number | string): string {
  return formatTime(date, 'YYYY/MM/DD');
}

/**
 * 数字补零
 */
function formatNumber(n: number): string {
  const s = n.toString();
  return s[1] ? s : '0' + s;
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(date: Date | number | string): string {
  const now = new Date().getTime();
  const time = new Date(date).getTime();
  const diff = now - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < day * 2) return '昨天';
  return formatDate(date);
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: number | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 颜色名称转颜色代码
 */
export function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    '红色': '#FF5252', '橙色': '#FF9800', '黄色': '#FFEB3B',
    '绿色': '#4CAF50', '蓝色': '#2196F3', '紫色': '#9C27B0',
    '黑色': '#212121', '白色': '#FFFFFF', '灰色': '#9E9E9E',
    '米色': '#F5F5DC', '藏青': '#000080', '酒红': '#800020'
  };
  return colorMap[colorName] || colorName;
}

/**
 * 获取系统信息
 */
export function getSystemInfo(): WechatMiniprogram.SystemInfo {
  return wx.getSystemInfoSync();
}

/**
 * 判断是否为iOS
 */
export function isIOS(): boolean {
  return getSystemInfo().platform === 'ios';
}
