# AI 服务配置信息

## 1. AI 对话接口配置

### 接口名称
`chatWithAI`

### 功能描述
实现与 AI 的自然语言对话，支持根据用户输入提供穿搭建议。

### 请求参数
```typescript
interface ChatWithAIParams {
  message: string; // 用户消息
  context?: any; // 对话上下文
}
```

### 响应参数
```typescript
interface ChatWithAIResponse {
  response: string; // AI 回复内容
  outfit?: any; // 推荐的穿搭（可选）
  suggestions?: string[]; // 后续操作建议（可选）
}
```

### 接入要求
- 支持自然语言理解和生成
- 能够理解穿搭相关的问题
- 提供结构化的回复格式

## 2. AI 服饰识别接口配置

### 接口名称
`recognizeClothing`

### 功能描述
分析上传的服饰图片，识别服饰的品类、颜色、款式等信息。

### 请求参数
```typescript
interface RecognizeClothingParams {
  imageUrl: string; // 图片URL
}
```

### 响应参数
```typescript
interface RecognizeClothingResponse {
  category: string; // 品类（top/bottom/outer/shoes/accessory）
  colors: string[]; // 颜色数组
  style: string[]; // 款式数组
  confidence: number; // 识别置信度
  suggestion?: string; // 识别建议（可选）
}
```

### 接入要求
- 支持服饰图片分类识别
- 能够识别常见的颜色和款式
- 提供识别结果和置信度

## 3. AI 搭配推荐接口配置

### 接口名称
`recommendOutfit`

### 功能描述
根据用户的心情、场合、天气等信息，推荐合适的穿搭。

### 请求参数
```typescript
interface RecommendOutfitParams {
  mood?: string; // 心情（happy/calm/lively/lazy）
  occasion?: string; // 场合（casual/formal/sport/commute）
  weather?: any; // 天气信息
  preferences?: any; // 用户偏好
}
```

### 响应参数
```typescript
interface RecommendOutfitResponse {
  outfit: any; // 推荐的穿搭
  reason: string; // 推荐理由
  tips?: string[]; // 搭配建议（可选）
}
```

### 接入要求
- 能够根据多种条件推荐穿搭
- 提供推荐理由和搭配建议
- 支持个性化推荐

## 4. AI 风格分析接口配置

### 接口名称
`analyzeStyle`

### 功能描述
分析用户衣橱中的服饰，识别主导风格和风格分布。

### 请求参数
```typescript
interface AnalyzeStyleParams {
  clothingItems: any[]; // 服饰列表
}
```

### 响应参数
```typescript
interface AnalyzeStyleResponse {
  dominantStyle: string; // 主导风格
  styleDistribution: Record<string, number>; // 风格分布
  suggestions: string[]; // 风格建议
}
```

### 接入要求
- 能够分析衣橱中的服饰风格
- 提供风格分布统计
- 给出改进建议

## 5. AI 生成搭配建议接口配置

### 接口名称
`generateOutfitSuggestion`

### 功能描述
根据用户现有的服饰，生成搭配建议。

### 请求参数
```typescript
interface GenerateOutfitSuggestionParams {
  existingItems?: any[]; // 现有服饰（可选）
  targetCategory?: string; // 目标品类（可选）
  context?: any; // 上下文信息（可选）
}
```

### 响应参数
```typescript
interface GenerateOutfitSuggestionResponse {
  suggestions: any[]; // 搭配建议
  reason: string; // 建议理由
}
```

### 接入要求
- 能够根据现有服饰生成搭配建议
- 支持目标品类的搭配推荐
- 提供建议理由

## 6. AI 生成对话回复接口配置

### 接口名称
`generateAIReply`

### 功能描述
根据用户消息和对话历史，生成 AI 回复。

### 请求参数
```typescript
interface GenerateAIReplyParams {
  userMessage: string; // 用户消息
  conversationHistory: Array<{ role: string; content: string }>; // 对话历史
}
```

### 响应参数
```typescript
interface GenerateAIReplyResponse {
  reply: string; // AI 回复内容
  suggestions?: string[]; // 后续操作建议（可选）
  action?: string; // 建议的操作（可选）
  actionData?: any; // 操作数据（可选）
}
```

### 接入要求
- 能够理解对话历史
- 生成自然的回复内容
- 提供后续操作建议

## 接入方式

### 云函数集成
所有 AI 服务需要集成到 `cloudfunctions/ai/index.js` 中，通过云函数调用外部 AI API。

### 环境变量配置
项目支持从 `.env` 文件中读取 AI 服务配置。在 `cloudfunctions/ai/.env` 文件中添加以下配置：

#### 腾讯云AI服务配置
```bash
TENCENT_CLOUD_APP_ID=your_app_id
TENCENT_CLOUD_SECRET_ID=your_secret_id
TENCENT_CLOUD_SECRET_KEY=your_secret_key
```

#### 阿里云AI服务配置
```bash
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
```

#### 百度AI服务配置
```bash
BAIDU_API_KEY=your_api_key
BAIDU_SECRET_KEY=your_secret_key
```

#### OpenAI服务配置
```bash
OPENAI_API_KEY=612c09bd-6454-4453-9f57-e59d6c1169b7
OPENAI_API_BASE_URL=https://ark.cn-beijing.volces.com/api/coding/v3
```

#### Claude服务配置
```bash
CLAUDE_API_KEY=your_api_key
CLAUDE_API_BASE_URL=https://api.anthropic.com
```

#### AI模型配置
```bash
AI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2048
```

### 依赖安装
需要在云函数中安装以下依赖：
```bash
cd cloudfunctions/ai
npm install
```

## 测试要求

- 每个接口需要提供 Mock 数据进行测试
- 接入真实 AI 服务后需要进行单元测试
- 测试数据应覆盖多种场景

