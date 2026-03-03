# AI OOTD 小程序技术文档

## 项目概述

AI OOTD 是一款智能穿搭推荐小程序，通过 AI 帮助用户管理衣橱、推荐穿搭搭配，最大化利用用户自己的服饰。

---

## 一、技术栈

### 核心技术
- **运行环境**: 微信小程序基础库 2.32.3+
- **编程语言**: TypeScript (ES2020)
- **样式预处理器**: Sass/SCSS
- **渲染引擎**: Skyline (微信原生渲染)
- **组件框架**: glass-easel
- **云开发**: 微信云开发（云函数、云数据库、云存储）
- **AppID**: `wxb4ee0a36fe301429`

### 开发工具
- **IDE**: 微信开发者工具
- **编辑器配置**: 2 空格缩进, Tab 使用空格

---

## 二、项目结构

```
miniprogram/
├── app.ts/json/scss       # 应用入口
├── pages/                 # 页面目录
│   ├── closet/             # 衣橱页面
│   │   ├── closet.ts
│   │   ├── closet.json
│   │   ├── closet.wxml
│   │   └── closet.scss
│   ├── recommend/          # AI推荐页面
│   │   ├── recommend.ts
│   │   ├── recommend.json
│   │   ├── recommend.wxml
│   │   └── recommend.scss
│   └── profile/             # 个人中心页面
│       ├── profile.ts
│       ├── profile.json
│       ├── profile.wxml
│       └── profile.scss
├── components/            # 组件目录
│   ├── navigation-bar/     # 自定义导航栏
│   ├── clothing-card/      # 服饰卡片
│   ├── outfit-display/      # 穿搭展示
│   ├── tab-bar/            # 底部Tab切换
│   ├── filter-bar/          # 筛选栏
│   ├── chat-bubble/         # 对话气泡
│   ├── chat-input/          # 对话输入
│   └── weather-widget/      # 天气组件
├── styles/                # 样式目录
│   ├── variables.scss       # 全局样式变量
│   ├── mixins.scss          # 样式混入
│   └── base.scss            # 基础样式
├── types/                 # 类型定义目录
│   └── index.ts            # 全局类型定义
├── utils/                 # 工具类目录
│   ├── cloud.ts            # 云开发工具封装
│   ├── storage.ts          # 本地存储封装
│   └── util.ts             # 通用工具
└── services/              # 服务层目录
    ├── clothing.ts         # 服饰服务（调用云函数）
    ├── outfit.ts           # 搭配服务（调用云函数）
    ├── user.ts             # 用户服务（调用云函数）
    ├── ai.ts               # AI 服务（调用云函数）
    └── weather.ts          # 天气服务（和风天气API）

cloudfunctions/             # 云函数目录
├── clothing/              # 服饰相关云函数
│   ├── index.js
│   └── package.json
├── outfit/                # 搭配相关云函数
│   ├── index.js
│   └── package.json
├── user/                  # 用户相关云函数
│   ├── index.js
│   └── package.json
├── ai/                    # AI相关云函数
│   ├── index.js
│   └── package.json
└── weather/               # 天气相关云函数
    ├── index.js
    └── package.json
```

---

## 三、核心配置

### 3.1 app.json

```json
{
  "pages": [
    "pages/closet/closet",
    "pages/recommend/recommend",
    "pages/profile/profile"
  ],
  "window": {
    "navigationBarTextStyle": "black",
    "navigationStyle": "custom"
  },
  "style": "v2",
  "componentFramework": "glass-easel",
  "lazyCodeLoading": "requiredComponents",
  "rendererOptions": {
    "skyline": {
      "defaultDisplayBlock": true,
      "defaultContentBox": true,
      "tagNameStyleIsolation": "legacy",
      "disableABTest": true,
      "sdkVersionBegin": "3.0.0",
      "sdkVersionEnd": "15.255.255"
    }
  },
  "cloudfunctionRoot": "cloudfunctions/",
  "cloud": true
}
```

### 3.2 配置说明
- **导航栏**: 自定义模式 (`navigationStyle: custom`)
- **渲染**: Skyline + glass-easel 组件框架
- **加载**: 按需需加载组件 (`lazyCodeLoading: requiredComponents`)
- **云开发**: 启用云函数和云存储
- **TypeScript**: 严格模式，禁用隐式 any

---

## 四、云开发规范

### 4.1 用户身份获取（免登录）

> **重要**：使用云开发时，小程序免登录，在云函数中获取用户 OPENID

```javascript
// cloudfunctions/user/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const tcb = cloud.database()
const _ = tcb.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 根据 openid 查询或创建用户
  const userRes = await tcb.collection('users').where({
    openid: openid
  }).get()

  if (userRes.data.length === 0) {
    // 新用户，创建用户记录
    await tcb.collection('users').add({
      data: {
        openid: openid,
        createdAt: new Date()
      }
    })
  }

  return {
    openid: openid,
    unionid: wxContext.UNIONID,
    appid: wxContext.APPID
  }
}
```

### 4.2 云数据库集合设计

```javascript
// 云数据库集合
collections: {
  users,           // 用户表
  clothing,        // 服饰表
  outfits,         // 搭配表
  preferences,     // 风格偏好表
  history          // 操作历史表
}
```

### 4.3 云存储目录结构

```
cloudstorage/
├── clothing/       # 服饰图片
├── outfit/          # 穿搭图片
├── avatar/          # 用户头像
└── temp/            # 临时图片
```

---

## 五、数据模型

### 5.1 服饰

```typescript
interface ClothingItem {
  _id?: string;              // 云数据库 ID
  openid: string;             // 用户 OPENID
  imageUrl: string;           // 图片URL（云存储）
  name: string;              // 服饰名称
  category: Category;         // 品类
  color: string[];            // 颜色数组
  season: Season[];           // 季节数组
  occasion: Occasion[];       // 场合数组
  style: Style[];             // 款式数组
  material: string[];        // 材质数组
  note: string;               // 备注
  useCount: number;           // 使用次数
  lastUsedAt?: Date;          // 最后使用时间
  createdAt: Date;           // 创建时间
  updatedAt: Date;           // 更新时间
}
```

### 5.2 搭配

```typescript
interface Outfit {
  _id?: string;              // 云数据库 ID
  openid: string;             // 用户 OPENID
  itemIds: string[];         // 服饰 ID 数组
  date?: Date;                // 穿搭日期（历史记录）
  isFavorited: boolean;        // 是否收藏 (Toggle 状态, 权重 3)
  hasLiked: boolean;           // 是否点赞 (Toggle 状态, 权重 1)
  hasWorn: boolean;            // 是否已穿搭 (权重 2)
  appliedWeight: number;       // 已应用权重 (封顶 3, 支持差值回退)
  tags?: string[];            // 标签
  note?: string;               // 备注
  reason?: string;             // 推荐理由 (Explainer)
  createdAt: Date;           // 创建时间
}
```


### 5.3 风格偏好

```typescript
interface StylePreference {
  _id?: string;              // 云数据库 ID
  openid: string;             // 用户 OPENID
  preferredColors: string[];   // 偏爱颜色
  preferredStyles: string[];   // 偏爱风格
  preferredOccasions: string[]; // 偏爱场合
  moods: Mood[];              // 偏爱心情
  updatedAt: Date;           // 更新时间
}
```

### 5.4 用户

```typescript
interface User {
  _id?: string;              // 云数据库 ID
  openid: string;             // 微信 OPENID
  unionid?: string;           // 微信 UnionID
  avatarUrl?: string;         // 头像URL
  nickName?: string;          // 昵称
  createdAt: Date;           // 创建时间
}
```

---

## 六、枚举定义

### 6.1 品类

```typescript
enum Category {
  TOP = 'top',           // 上衣
  BOTTOM = 'bottom',     // 下装
  OUTER = 'outer',       // 外套
  SHOES = 'shoes',     // 鞋履
  ACCESSORY = 'accessory' // 配饰
}
```

### 6.2 季节

```typescript
enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}
```

### 6.3 场合

```typescript
enum Occasion {
  CASUAL = 'casual',     // 休闲
  FORMAL = 'formal',     // 正式
  SPORT = 'sport',       // 运动
  COMMUTE = 'commute'    // 通勤
}
```

### 6.4 款式

```typescript
enum Style {
  ROUND_NECK = 'round_neck',         // 圆领
  V_NECK = 'v_neck',             // V领
  HIGH_NECK = 'high_neck',       // 高领
  LOW_NECK = 'low_neck',         // 低领
  DROPPED_SHOULDER = 'dropped_shoulder',  // 落肩
  STRUCTURED_SHOULDER = 'structured_shoulder',  // 正肩
  SLIM_FIT = 'slim_fit',       // 修身
  LOOSE_FIT = 'loose_fit',     // 宽松
  CROPPED = 'cropped',         // 短款
  LONG = 'long'                // 长款
}
```

### 6.5 心情

```typescript
enum Mood {
  HAPPY = 'happy',     // 开心
  CALM = 'calm',      // 沉稳
  LIVELY = 'lively',  // 活泼
  LAZY = 'lazy'       // 慵懒
}
```

### 6.6 反馈类型

```typescript
enum FeedbackType {
  FAVORITE = 'favorite', // 收藏 (权重 +2)
  LIKE = 'like',         // 喜欢 (权重 +1)
  DISLIKE = 'dislike'    // 不喜欢 (权重 -1)
}
```

---

## 七、云函数接口设计

### 7.1 服饰相关云函数

| 云函数 | 请求参数 | 响应 |
|--------|----------|------|
| clothing (action: add) | `{ imageUrl, category, color, season, occasion, style, material, note }` | 服饰对象 |
| clothing (action: get) | `{ id }` | 服饰对象 |
| clothing (action: update) | `{ id, category, color, season, occasion, style, material, note }` | 服饰对象 |
| clothing (action: delete) | `{ id }` | 成功/失败 |
| clothing (action: list) | `{ page, limit, category, season, occasion, search }` | 服饰列表 |
| clothing (action: identify) | `{ imageUrl }` | `{ category, color, season, occasion, style, material }` (Mock) |

### 7.2 搭配相关云函数

| 云函数 | 请求参数 | 响应 |
|--------|----------|------|
| outfit (action: recommend) | `{ type, weather, occasion, mood, referenceImage }` | 搭配对象 |
| outfit (action: history) | `{ page, limit }` | 搭配列表 |
| outfit (action: favorite) | `{ outfitId, isFavorited }` | 成功/失败 |
| outfit (action: favorites) | `{ page, limit }` | 搭配列表 |
| outfit (action: feedback) | `{ outfitId, type }` | 成功/失败 |
| outfit (action: create) | `{ itemIds, note, tags }` | 搭配对象 |

### 7.3 用户相关云函数

| 云函数 | 请求参数 | 响应 |
|--------|----------|------|
| user (action: getPreference) | - | 偏爱偏好对象 |
| user (action: updatePreference) | `{ preferredColors, preferredStyles, preferredOccasions, moods }` | 偏爱偏好对象 |
| user (action: getProfile) | - | 用户对象 |
| user (action: getIdle) | `{ days }` | 闲置服饰列表 |

### 7.4 外部服务

| 服务 | 说明 |
|------|------|
| 和风天气 API | 通过云函数调用，获取天气信息 |
| 微信云存储 | 上传图片，获取云存储 URL |

---

## 八、组件说明

### 8.1 复用现有组件

| 组件 | 用途 |
|------|------|
| navigation-bar | 所有页面的自定义导航栏 |

**navigation-barbar 属性**:
- `title` (String): 导航栏标题
- `background` (String): 背景色
- `color` (String): 文字颜色
- `back` (Boolean): 是否显示返回按钮，默认 true
- `homeButton` (Boolean): 是否显示首页按钮
- `loading` (Boolean): 是否显示加载状态
- `show` (Boolean): 是否显示导航栏
- `delta` (Number): 返回页面层级

### 8.2 新增组件

#### clothing-card
服饰卡片组件
- 显示服饰图片、名称
- 支持长按编辑
- 支持点击详情
- Hover 效果：上移 + 阴影增强

#### outfitting-display
穿搭展示组件
- 多图组合展示
- 支持评分操作（喜欢/一般/不喜欢）
- 支持收藏
- 响应式网格布局（小屏2列/中屏3列）

#### tab-bar
底部 Tab 切换组件
- 衣橱 / 推荐 / 我的
- 毛玻璃效果（backdrop-filter: blur）

#### filter-bar
筛选栏组件
- 搜索框
- 分类下拉选择（品类/季节/场合）
- 标签选择
- 水平滚动

#### chat-bubble
对话气泡组件
- AI 消息气泡（左侧，浅灰背景）
- 用户消息气泡（右侧，紫色渐变）
- 支持快捷操作按钮

#### chat-input
对话输入组件
- 文本输入框
- 快捷回复按钮（天气/场合/心情等）
- 图片上传（参考穿搭图）
- 支持 typewriter 打字效果

#### weather-widget
天气组件
- 显示当前天气和位置
- 自动获取位置信息

---

## 九、UI/UX 规范

### 9.1 设计理念
- **高端杂志感**: 采用杂志排版美学，大面积留白，精致字体
- **科技极简**: 极简设计，突出内容本身，科技感十足
- **动态响应**: 流式布局，自适应不同屏幕尺寸，不使用固定宽度
- **深邃紫调**: 高端紫色主题(#6C5CE7)，营造专业时尚感

### 9.2 颜色系统

**主题色（深邃紫系）**:
- `--color-primary`: `#6C5CE7` - 主色调，品牌色、按钮
- `--color-primary-dark`: `#4A45B8` - 主色调深色
- `--color-primary-light`: `#E8E7F` - 主色调浅色
- `--color-secondary`: `#8A7FB0` - 辅主色，渐变用
- `--color-accent`: `#FF6B9` - 强调色，收藏、喜欢

**背景色（浅灰/米白系）**:
- `--color-bg`: `#F5F5F5` - 页面背景（米白）
- `--color-bg-white`: `#FFFFFF` - 卡片背景（纯白）
- `--color-bg-purple`: `#FAF9FF` - 紫色微调背景
- `--color-bg-gray`: `#F0F0F0` - 次要背景，AI 消息
- `--color-divider`: `#E8E8E8` - 分割线，极淡

**文字色**:
- `--color-text-primary`: `#1A1A1A` - 主要文字
- `--color-text-secondary`: `#666666` - 次要文字
- `--color-text-tertiary`: `#999999` - 辅助文字
- `--color-text-purple`: `#6C5CE7` - 品牌文字

### 9.3 字体系统

**字体家族**:
```scss
--font-family-base: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
--font-family-number: 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
--font-family-display: 'Playfair Display', 'Georgia', serif; // 标题用衬线体，杂志感
```

**字体大小（rem 单位）**:
- `--font-size-xs`: `0.625rem` - 标签文字
- `--font-size-sm`: `0.75rem` - 辅助文字
- `--font-size-base`: `0.8125rem` - 正文
- `--font-size-lg`: `0.875rem` - 次级标题
- `--font-size-xl`: `1rem` - 页面标题
- `--font-size-xxl`: `1.25rem` - 大标题

**字重**:
- `--font-weight-normal`: `400` - 正文
- `--font-weight-medium`: `500` - 次级强调
- `--font-weight-semibold`: `600` - 较强强调
- `--font-weight-bold`: `700` - 标题

### 9.4 间距系统（rem 单位）

- `--spacing-0`: `0` - 无间距
- `--spacing-xs`: `0.25rem` - 极小间距
- `--spacing-sm`: `0.5rem` - 小间距
- `--spacing-base`: `1rem` - 基础间距
- `--spacing-lg`: `1.5rem` - 大间距
- `--spacing-xl`: `2rem` - 超大间距
- `--spacing-xxl`: `3rem` - 特大间距

### 9.5 布局系统

**动态网格布局**:
```scss
// 衣橱列表 - 自适应列数
.clothing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);

  // 中屏 3 列
  @media (min-width: 400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  // 大屏 4 列
  @media (min-width: 540px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Flex 弹性布局**:
```scss
.flex-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
```

### 9.6 动画效果

**动画时长**:
- `--duration-fast`: `200ms` - 快速动画
- `--duration-base`: `300ms` - 基础动画
- `--duration-slow`: `500ms` - 慢速动画

**缓动函数**:
- `--ease-in`: `cubic-bezier(0.4, 0, 1, 1)` - 缓入
- `--ease-out`: `cubic-bezier(0, 0, 0.2, 1)` - 缓出
- `--ease-in-out`: `cubic-bezier(0.4, 0, 0.2, 1)` - 缓入缓出
- `--ease-bounce`: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - 弹跳效果

### 9.7 交互反馈

- **点击**: 透明度变化 + 轻微缩放
- **长按**: 震动反馈
- **加载**: Loading 动画（紫色旋转）
- **成功/失败**: Toast 提示

---

## 十、开发规范

### 10.1 命名规范
- 文件/组件: kebab-case
- 变量: camelCase
- 常量: UPPER_SNAKE_CASE
- 类名: PascalCase

### 10.2 代码规范
- TypeScript 严格模式
- 禁止使用 `any` 类型
- 使用 Sass 预处理器
- 使用 CSS 变量系统

### 10.3 样式文件组织

```
├── app.scss              # 全局样式
├── styles/
│   ├── variables.scss    # 样式变量
│   ├── mixins.scss      # 样式混入
│   └── base.scss        # 基础样式
└── pages/
    ├── closet/
    │   └── closet.scss   # 页面样式
    ├── recommend/
    │   └── recommend.scss
    └── profile/
        └── profile.scss
```

### 10.4 扩展方式

**添加页面**:
1. 在 `pages/` 创建页面文件夹
2. 在 `app.json` 的 `pages` 数组中注册

**添加组件**:
1. 在 `components/` 创建组件文件夹
2. 在页面 JSON 中通过 `usingComponents` 引入

**安装 NPM 包**:
```bash
npm install <package>
# 然后在微信开发者工具中点击"工具 > 构建 npm"
```

---

## 十一、注意事项

1. **云开发免登录**: 通过云函数的 `cloud.getWXContext().OPENID` 自动获取用户身份
2. **自定义导航栏**: 需要手动处理安全区域适配
3. **Skyline 渲染**: 某些旧 API 可能不兼容
4. **类型安全**: TypeScript 严格模式要求严格的类型检查
5. **图片上传**: 上传到微信云存储，自动 CDN 加速
6. **动态布局**: 不使用固定宽度，优先使用百分比、rem、Grid/Flex
7. **响应式适配**: 小屏 2 列 / 中屏 3 列 / 大屏 4 列
8. **图片加载**: 使用占位符和淡入动画提升体验

---

## 十二、待实现功能

### 12.1 阶段一：基础框架
- [ ] 创建3个主页面（closet/recommend/profile）
- [ ] 实现底部 Tab 切换
- [ ] 配置 navigation-bar 组件
- [ ] 搭建全局样式变量系统
- [ ] 配置微信云开发环境

### 12.2 阶段二：衣橱管理
- [ ] 实现服饰列表展示（响应式网格）
- [ ] 实现添加服饰页面
- [ ] 实现筛选功能
- [ ] 集成云数据库存储
- [ ] AI 识图接口（Mock）

### 12.3 阶段三：推荐功能
- [ ] 实现对话式推荐界面
- [ ] 实现对话流程管理
- [ ] 实现推荐结果展示
- [ ] 集成和风天气 API
- [ ] 基于标签匹配的推荐算法（第一版）

### 12.4 阶段四：个人中心
- [ ] 实现风格偏好设置
- [ ] 实现穿搭历史
- [ ] 实现断舍离功能
- [ ] 实现收藏搭配

### 12.5 阶段五：高级功能
- [ ] 接入真实 AI 识图服务
- [ ] 迭代为 AI 智能推荐
- [ ] 性能优化

---

## 十三、待确认事项

1. [ ] 云开发环境 ID（需在微信开发者工具中创建）
2. [ ] 和风天气 API Key（需申请）
3. [ ] 第三方 AI 服务选择（第一版使用 Mock）
