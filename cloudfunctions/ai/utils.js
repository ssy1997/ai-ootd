/* ========================================
   AI服务工具模块 - AI Utils
   ======================================== */

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryOnStatuses: [408, 429, 500, 502, 503, 504]
};

// 速率限制配置
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000 // 1分钟
};

// 简单的内存速率限制器（生产环境建议使用Redis）
const rateLimiter = {
  requests: [],
  check: function() {
    const now = Date.now();
    // 清理过期的请求记录
    this.requests = this.requests.filter(time => now - time < RATE_LIMIT.windowMs);

    if (this.requests.length >= RATE_LIMIT.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  },
  reset: function() {
    this.requests = [];
  }
};

/**
 * 带指数退避的重试机制
 * @param {Function} fn - 要执行的异步函数
 * @param {Object} options - 重试配置选项
 * @returns {Promise<any>} - 执行结果
 */
async function retryWithBackoff(fn, options = {}) {
  const config = {
    maxRetries: options.maxRetries || RETRY_CONFIG.maxRetries,
    baseDelay: options.baseDelay || RETRY_CONFIG.baseDelay,
    maxDelay: options.maxDelay || RETRY_CONFIG.maxDelay,
    retryOnStatuses: options.retryOnStatuses || RETRY_CONFIG.retryOnStatuses
  };

  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 检查是否应该重试
      const shouldRetry =
        attempt < config.maxRetries &&
        (config.retryOnStatuses.includes(error.response?.status) ||
         error.code === 'ECONNRESET' ||
         error.code === 'ETIMEDOUT' ||
         error.message?.includes('timeout'));

      if (!shouldRetry) {
        break;
      }

      // 计算延迟时间（指数退避）
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt),
        config.maxDelay
      );

      console.log(`重试第 ${attempt + 1} 次，延迟 ${delay}ms...`);

      // 添加随机抖动避免惊群效应
      const jitteredDelay = delay + Math.random() * 200;

      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }

  throw lastError;
}

/**
 * AI配置验证
 * @param {Object} config - AI配置对象
 * @returns {Object} - 验证结果 { valid: boolean, errors: string[] }
 */
function validateAIConfig(config) {
  const errors = [];

  if (!config) {
    return { valid: false, errors: ['配置对象不能为空'] };
  }

  // 验证API Key
  if (!config.apiKey || typeof config.apiKey !== 'string') {
    errors.push('API Key必须是非空字符串');
  } else if (config.apiKey.length < 10) {
    errors.push('API Key格式可能不正确');
  }

  // 验证Base URL
  if (config.baseUrl) {
    try {
      new URL(config.baseUrl);
    } catch (e) {
      errors.push('Base URL格式不正确');
    }
  }

  // 验证模型名称
  if (config.model && typeof config.model !== 'string') {
    errors.push('模型名称必须是字符串');
  }

  // 验证温度参数
  if (config.temperature !== undefined) {
    if (typeof config.temperature !== 'number' ||
        config.temperature < 0 ||
        config.temperature > 2) {
      errors.push('温度参数必须在0-2之间');
    }
  }

  // 验证最大Token数
  if (config.maxTokens !== undefined) {
    if (typeof config.maxTokens !== 'number' ||
        config.maxTokens <= 0 ||
        config.maxTokens > 128000) {
      errors.push('最大Token数必须是正整数且不超过128000');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 响应数据清理（防止XSS等安全问题）
 * @param {any} data - 原始数据
 * @returns {any} - 清理后的数据
 */
function sanitizeAIResponse(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // 移除HTML标签
    return data
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeAIResponse(item));
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeAIResponse(data[key]);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * 安全JSON解析 (正则表达式增强版)
 * @param {string} str - JSON字符串
 * @param {any} defaultValue - 解析失败时的默认值
 * @returns {any} - 解析结果
 */
function parseJSONSafely(str, defaultValue = null) {
  if (typeof str !== 'string') return defaultValue;

  try {
    let jsonStr = str.trim();

    // 1. 尝试直接提取 JSON 部分（核心增强）
    // 该正则会匹配最外层的 [] 或 {} 及其内部内容，无视前后的废话
    const jsonMatch = jsonStr.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // 2. 移除可能残留的 markdown 标记
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('[JSON Parse Error] 原始数据:', str);
    console.error('[JSON Parse Error] 错误详情:', error.message);
    return defaultValue;
  }
}

/**
 * 请求速率限制检查
 * @returns {Object} - { allowed: boolean, resetAfter: number }
 */
function checkRateLimit() {
  const allowed = rateLimiter.check();
  const now = Date.now();

  // 计算窗口内最早的请求时间
  const oldestRequest = rateLimiter.requests[0];
  const resetAfter = oldestRequest
    ? Math.max(0, oldestRequest + RATE_LIMIT.windowMs - now)
    : 0;

;

  return {
    allowed,
    resetAfter,
    limit: RATE_LIMIT.maxRequests,
    remaining: allowed ? RATE_LIMIT.maxRequests - rateLimiter.requests.length : 0
  };
}

/**
 * 重置速率限制器（用于测试或特殊情况）
 */
function resetRateLimiter() {
  rateLimiter.reset();
}

/**
 * 请求日志记录
 * @param {Object} logData - 日志数据
 */
function logRequest(logData) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: logData.action || 'unknown',
    openid: logData.openid || 'anonymous',
    success: logData.success !== false,
    duration: logData.duration || 0,
    error: logData.error || null
  };

  console.log(JSON.stringify(logEntry));
}

/**
 * 辅助函数：计算延迟时间
 * @param {number} attempt - 当前尝试次数
 * @param {Object} config - 重试配置
 * @returns {number} - 延迟时间（毫秒）
 */
function calculateDelay(attempt, config) {
  const baseDelay = config.baseDelay || RETRY_CONFIG.baseDelay;
  const maxDelay = config.maxDelay || RETRY_CONFIG.maxDelay;

  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 200;

  return delay + jitter;
}

/**
 * 辅助函数：检查是否应该重试
 * @param {Error} error - 错误对象
 * @param {number[]} retryOnStatuses - 可重试的状态码列表
 * @returns {boolean} - 是否应该重试
 */
function shouldRetry(error, retryOnStatuses) {
  const statusCodes = retryOnStatuses || RETRY_CONFIG.retryOnStatuses;

  return statusCodes.includes(error.response?.status) ||
         error.code === 'ECONNRESET' ||
         error.code === 'ETIMEDOUT' ||
         error.code === 'ENOTFOUND' ||
         error.code === 'EAI_AGAIN' ||
         error.message?.includes('timeout') ||
         error.message?.includes('network');
}

module.exports = {
  RETRY_CONFIG,
  RATE_LIMIT,
  retryWithBackoff,
  validateAIConfig,
  sanitizeAIResponse,
  parseJSONSafely,
  checkRateLimit,
  resetRateLimiter,
  logRequest,
  calculateDelay,
  shouldRetry
};
