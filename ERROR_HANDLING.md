# 异常与边界处理规范 (Error & Edge Case Handling)

**版本**: 1.0.0
**状态**: Draft
**适用范围**: 所有云函数及前端服务调用

本文档定义了系统中最基础且关键的异常处理策略，旨在保证系统的健壮性（Robustness）和用户体验的优雅降级（Graceful Degradation）。

---

## 1. 统一错误码 (Standard Error Codes)

所有服务（云函数）的返回结构必须遵循 `CloudFunctionResponse` 接口，其中 `code` 字段应严格遵守以下标准。

| 错误码 | 含义 | 适用场景 | 处理策略 |
| :--- | :--- | :--- | :--- |
| **200** | **Success** | 操作成功 | 正常渲染数据 |
| **400** | **Bad Request** | 参数缺失、格式错误、业务规则校验失败 (e.g. 衣服少于2件无法推荐) | 前端 Toast 提示具体错误信息 |
| **401** | **Unauthorized** | 未登录或 OpenID 获取失败 | 引导用户重新授权或静默重试登录 |
| **404** | **Not Found** | 请求的资源（服饰/搭配）不存在 | 显示空状态或自动跳转回列表页 |
| **429** | **Rate Limit** | AI 服务调用过于频繁 | 提示“请稍后再试”，前端禁止按钮点击 3-5秒 |
| **500** | **Internal Error** | 代码崩溃、数据库异常、第三方服务挂掉 | 前端提示“服务暂时不可用”，记录日志 |

### 1.1 响应示例

```json
// 成功
{
  "code": 200,
  "message": "success",
  "data": { ... }
}

// 失败
{
  "code": 400,
  "message": "服饰数量不足，请至少添加2件",
  "data": null
}
```

---

## 2. 外部 API 重试策略 (Retry Policy)

针对不稳定的外部依赖（如 AI 服务、天气 API），必须实施重试机制。

*   **适用对象**: `ai` 云函数, `weather` 云函数
*   **策略**: Exponential Backoff (指数退避)
*   **配置**:
    *   最大重试次数: `3` 次
    *   初始延迟: `1000ms`
    *   最大延迟: `10000ms`
*   **代码实现参考**:
    ```javascript
    async function retryWithBackoff(fn, retries = 3) {
      try {
        return await fn();
      } catch (err) {
        if (retries <= 0) throw err;
        await new Promise(r => setTimeout(r, 1000)); // 简单固定延迟或指数延迟
        return retryWithBackoff(fn, retries - 1);
      }
    }
    ```

---

## 3. 核心业务降级策略 (Fallback Strategies)

当核心依赖（AI/Weather）不可用时，系统不能白屏，必须提供兜底方案。

### 3.1 推荐服务 (`outfit.recommend`)
*   **场景**: AI 服务超时或报错。
*   **降级方案**:
    1.  **Level 1 (AI 挂了)**: 切换到纯规则推荐（Rule-based）。根据当前温度和随机算法，从数据库捞取一套符合季节的衣服。
    2.  **Level 2 (规则也空了)**: 返回文案提示“你的衣橱太满啦（或太空啦），暂时想不出搭配，快去添加新衣服吧！”

### 3.2 天气服务 (`weather.current`)
*   **场景**: 天气 API 额度耗尽或超时。
*   **降级方案**:
    1.  **Cache**: 优先使用最近 30 分钟内的缓存数据。
    2.  **Default**: 无法获取时，默认假设为“晴天，20°C”（最通用的穿搭环境），并在 UI 上标记“未获取到实时天气”。

---

## 4. 数据库事务与一致性 (Data Consistency)

针对涉及多个集合的数据修改，需保证原子性或最终一致性。

### 4.1 穿搭确认 (`action: 'wear'`)
*   **操作**: 1. 创建 Outfit History; 2. 更新 Clothing (Usage+1)。
*   **风险**: 1 成功 2 失败，导致数据不一致。
*   **对策**:
    *   使用 `db.runTransaction` (如果云开发环境支持)。
    *   如果不支持事务，采用 **"Best Effort"** 策略：先创建 History (关键业务)，再异步更新 Usage (非关键统计)。即使 Usage 更新失败，不阻断主流程，只记录 Error Log。

### 4.2 数据清理
*   **场景**: 删除某件衣服 (`clothing.delete`)。
*   **边界**: 该衣服可能被多个 `Outfit` 引用。
*   **对策**: 
    *   **软删除**: `clothing` 表增加 `isDeleted` 字段，不物理删除。
    *   **渲染保护**: 前端渲染 Outfit 时，若发现关联的 `items` 中有 `isDeleted=true` 或找不到数据的，显示“该单品已失效”占位图，而不是崩溃。

---

## 5. 前端边界交互 (Frontend Edge Cases)

### 5.1 网络异常
*   **表现**: 任何 `request` 失败。
*   **处理**: 统一拦截器，Toast 提示“网络开小差了”，并提供“点击重试”按钮（非自动重试，避免死循环）。

### 5.2 空状态 (Empty States)
*   **衣橱**: 显示“添加第一件衣服”引导页。
*   **推荐**: 显示“衣橱空空如也”插画，引导去添加。
*   **历史**: 显示“还没有穿搭记录哦”。

### 5.3 极端输入
*   **AI 对话**: 用户输入乱码或敏感词。 -> AI 服务应返回通用兜底回复“抱歉，我没理解您的意思...”。
*   **图片上传**: 图片过大或非图片格式。 -> 上传前校验 `size < 2MB` 和 `type in ['jpg', 'png']`。
