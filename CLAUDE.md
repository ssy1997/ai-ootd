# AI OOTD 小程序技术规范

> 本文档是项目开发的核心技术规范，所有开发人员必须严格遵守，确保全流程一致性。

## 项目规范
- When compacting, always preserve: 改动文件及其摘要
- 所有 API 使用必须以 官方文档 为准，微信小程序的 API 文档地址如下：
| 用途 | 链接 |
|------|------|
| API 总览 | https://developers.weixin.qq.com/miniprogram/dev/api/ |
| 组件文档 | https://developers.weixin.qq.com/miniprogram/dev/component/ |
| CloudBase 云开发 | https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html |
| WXML 组件文档 | https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/ |
| WXS 脚本文档 | https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/ |

- 和风天气API文档：
https://dev.qweather.com/docs/api/weather/weather-daily-forecast/
https://dev.qweather.com/docs/api/weather/weather-now/


---

## 一、技术栈

### 1.1 核心技术

| 技术 | 版本/配置 | 用途 |
|------|----------|------|
| 微信小程序基础库 | 2.32.3+ | 运行环境 |
| TypeScript | ES2020 | 编程语言（严格模式） |
| Sass/SCSS | 最新 | 样式预处理器 |
| Skyline | - | 微信原生渲染引擎 |
| glass-easel | - | 组件框架 |
| 微信云开发 | - | 云函数、云数据库、云存储 |
| AppID | `wxb4ee0a36fe301429` | 小程序标识 |

### 1.2 开发工具

- **IDE**: 微信开发者工具（推荐最新稳定版）
- **编辑器配置**: 2 空格缩进，Tab 使用空格

### 1.3 外部 API

| API 名称 | 用途 | 官方文档 |
|---------|------|----------|
| 和风天气 API | 获取天气信息 | https://dev.qweather.com/docs/api/ |

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
│   └── profile/           # 个人中心页面
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
├── weather/               # 天气相关云函数
│   ├── index.js
│   └── package.json
└── database-init/          # 数据库初始化云函数
    ├── index.js
    └── package.json
```

---

## 三、核心配置

### 3.1 app.json 配置

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

### 3.2 tsconfig.json 配置约束

- **严格模式**: 必须启用
- **禁用隐式 any**: `noImplicitAny: true`
- **严格空值检查**: `strictNullChecks: true`

### 3.3 project.config.json 配置

```json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionTemplateRoot": "cloudfunctionTemplate",
  "cloudfunctionTemplateExternalDependencies": true,
  "cloudfunctionRootRemoteRelativePath": "cloudfunctions",
  "miniprogramNpmDirName": "miniprogram_npm",
  "cloudbaseRoot": "./cloudbase",
  "compileType": "miniprogram",
  "appid": "wxb4ee0a36fe301429",
  "projectname": "AI OOTD",
  "cloudFunctionTemplateRoot": "./cloudfunctionTemplate",
  "libVersion": "2.32.3",
  "condition": {}
}
```

---

## 四、云开发规范

### 4.1 初始化云开发

```typescript
// miniprogram/app.ts
wx.cloud.init({
  env: 'your-env-id',  // 云开发环境ID
  traceUser: true
})
```

### 4.2 用户身份获取（免登录）

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

### 4.3 云数据库集合设计

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

### 4.4 云存储目录结构

```
cloudstorage/
├── clothing/       # 服饰图片
├── outfit/          # 穿搭图片
├── avatar/          # 用户头像
└── temp/            # 临时图片
```

### 4.5 云函数调用规范

```typescript
// miniprogram/services/clothing.ts
export async function addClothing(data: ClothingData) {
  try {
    const res = await wx.cloud.callFunction({
      name: 'clothing',
      data: {
        action: 'add',
        ...data
      }
    })
    return res.result
  } catch (err) {
    console.error('添加服饰失败', err)
    throw err
  }
}
```

---

## 五、数据模型

### 5.1 服饰 (ClothingItem)

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

### 5.2 搭配 (Outfit)

```typescript
interface Outfit {
  _id?: string;              // 云数据库 ID
  openid: string;             // 用户 OPENID
  itemIds: string[];         // 服饰 ID 数组
  date?: Date;               // 穿搭日期（历史记录）
  isFavorited: boolean;      // 是否收藏
  tags?: string[];            // 标签
  note?: string;              // 备注
  createdAt: Date;           // 创建时间
}
```

### 5.3 风格偏好 (StylePreference)

```typescript
interface StylePreference {
  _id?: string;              // 云数据库 ID
  openid: string;             // 用户 OPENID
  preferredColors: string[];  // 偏爱颜色
  preferredStyles: string[];   // 偏爱风格
  preferredOccasions: string[]; // 偏爱场合
  moods: Mood[];             // 偏爱心情
  updatedAt: Date;           // 更新时间
}
```

### 5.4 用户 (User)

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

> 所有枚举值必须使用小写下划线命名，与云数据库存储格式保持一致

### 6.1 品类 (Category)

```typescript
enum Category {
  TOP = 'top',           // 上衣
  BOTTOM = 'bottom',     // 下装
  OUTER = 'outer',       // 外套
  SHOES = 'shoes',       // 鞋履
  ACCESSORY = 'accessory' // 配饰
}
```

### 6.2 季节 (Season)

```typescript
enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}
```

### 6.3 场合 (Occasion)

```typescript
enum Occasion {
  CASUAL = 'casual',     // 休闲
  FORMAL = 'formal',     // 正式
  SPORT = 'sport',       // 运动
  COMMUTE = 'commute'    // 通勤
}
```

### 6.4 款式 (Style)

```typescript
enum Style {
  ROUND_NECK = 'round_neck',         // 圆领
  V_NECK = 'v_neck',                // V领
  HIGH_NECK = 'high_neck',          // 高领
  LOW_NECK = 'low_neck',            // 低领
  DROPPED_SHOULDER = 'dropped_shoulder',  // 落肩
  STRUCTURED_SHOULDER = 'structured_shoulder',  // 正肩
  SLIM_FIT = 'slim_fit',            // 修身
  LOOSE_FIT = 'loose_fit',          // 宽松
  CROPPED = 'cropped',              // 短款
  LONG = 'long'                     // 长款
}
```

### 6.5 心情 (Mood)

```typescript
enum Mood {
  HAPPY = 'happy',     // 开心
  CALM = 'calm',      // 沉稳
  LIVELY = 'lively',  // 活泼
  LAZY = 'lazy'       // 慵懒
}
```

### 6.6 反馈类型 (FeedbackType)

```typescript
enum FeedbackType {
  LIKE = 'like',       // 喜欢
  NEUTRAL = 'neutral', // 一般
  DISLIKE = 'dislike'  // 不喜欢
}
```

---

## 七、样式系统规范

### 7.1 颜色系统（必须使用 CSS 变量）

```scss
// 主题色（深邃紫系）
--color-primary: #6C5CE7;
--color-primary-dark: #4A45B8;
--color-primary-light: #E8E7F5;
--color-secondary: #8A7FB0;
--color-accent: #FF6B9D;

// 背景色（浅灰/米白系）
--color-bg: #F5F5F5;
--color-bg-white: #FFFFFF;
--color-bg-purple: #FAF9FF;
--color-bg-gray: #F0F0F0;
--color-divider: #E8E8E8;

// 文字色
--color-text-primary: #1A1A1A;
--color-text-secondary: #666666;
--color-text-tertiary: #999999;
--color-text-purple: #6C5CE7;

// 功能色
--color-success: #52C41A;
--color-warning: #FAAD14;
--color-error: #EF4444;
--color-info: #6C5CE7;
```

### 7.2 字体系统

```scss
// 字体家族
--font-family-base: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
--font-family-number: 'SF Pro Text', Arial, sans-serif;
--font-family-display: 'Playfair Display', serif;  // 标题用衬线体

// 字体大小（使用 rem 单位）
--font-size-xs: 0.625rem;    // 标签文字
--font-size-sm: 0.75rem;      // 辅助文字
--font-size-base: 0.8125rem; // 正文
--font-size-lg: 0.875rem;     // 次级标题
--font-size-xl: 1rem;         // 页面标题
--font-size-xxl: 1.25rem;    // 大标题

// 字重
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

// 行高
--line-height-tight: 1.2;
--line-height-base: 1.6;
--line-height-loose: 1.8;
```

### 7.3 间距系统（使用 rem 单位）

```scss
--spacing-0: 0;
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-base: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-xxl: 3rem;
```

### 7.4 圆角系统

```scss
--radius-none: 0;
--radius-sm: 0.25rem;
--radius-base: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-full: 999px;
```

### 7.5 阴影系统

```scss
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-base: 0 4px 12px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.06);
--shadow-purple: 0 4px 16px rgba(108, 92, 231, 0.15);
```

### 7.6 动画系统

```scss
// 动画时长
--duration-fast: 200ms;
--duration-base: 300ms;
--duration-slow: 500ms;

// 缓动函数
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 八、响应式布局原则

> **严禁使用固定宽度**，必须使用动态响应式布局

### 8.1 布局规范

1. **使用 Grid/Flex**：：优先使用 CSS Grid 和 Flexbox
2. **相对单位**：使用 rem、em、百分比
3. **动态列数**：根据屏幕尺寸自动调整
4. **流式布局**：内容自适应容器宽度
5. **比例保持**：使用 aspect-ratio 保持图片比例

### 8.2 Grid 网格布局示例

```scss
// 衣橱列表 - 自适应列数
.clothing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  // 小屏 2 列
  gap: var(--spacing-sm);

  @media (min-width: 400px) {
    grid-template-columns: repeat(3, 1fr);  // 中屏 3 列
  }

  @media (min-width: 540px) {
    grid-template-columns: repeat(4, 1fr);  // 大屏 4 列
  }
}
```

### 8.3 Flex 弹性布局示例

```scss
.flex-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
```

### 8.4 图片比例示例

```scss
.clothing-image {
  width: 100%;
  aspect-ratio: 1 / 1;  // 正方形比例
  object-fit: cover;
}
```

---

## 九、命名规范

### 9.1 文件命名

- **页面/组件**: kebab-case（小写字母+连字符）
  - 示例：`closet-card`, `outfit-display`, `chat-bubble`

### 9.2 变量命名

- **变量/函数**: camelCase（小驼峰）
  - 示例：`getUserInfo`, `clothingItems`, `isLoading`

- **常量**: UPPER_SNAKE_CASE（大写下划线）
  - 示例：`API_BASE_URL`, `MAX_UPLOAD_SIZE`

### 9.3 类/接口命名

- **类/接口**: PascalCase（大驼峰）
  - 示例：`ClothingService`, `UserManager`

### 9.4 样式命名（BEM 规范）

- **Block**: `.block`
- **Element**: `.block__element`
- **Modifier**: `.block--modifier`

```scss
// BEM 示例
.clothing-card { }                    // Block
.clothing-card__image { }              // Element
.clothing-card__info { }                // Element
.clothing-card--active { }              // Modifier
.clothing-card__info--highlight { }      // Modifier
```

---

## 十、代码规范

### 10.1 TypeScript 规范

1. **严格模式**: 必须启用 TypeScript 严格模式
2. **禁用 any**: 严格禁止使用 `any` 类型
3. **类型注解**: 所有变量必须有明确类型
4. **接口优先**: 优先使用 interface 定义对象类型

### 10.2 样式规范

1. **使用 Sass**: 必须使用 SCSS 预处理器
2. **CSS 变量**: 颜色、间距等必须使用 CSS 变量
3. **BEM 命名**: 类名必须遵循 BEM 规范
4. **相对单位**: 必须使用 rem/em/百分比，禁用固定 px

### 10.3 组件规范

1. **单一职责**: 每个组件只负责单一功能
2. **props 定义**: 必须明确声明组件属性类型
3. **事件命名**: 事件名使用 on- 前缀
4. **组件复用**: 优先复用现有组件

### 10.4 云函数规范

1. **使用 wx-server-sdk**: 云函数必须使用 `wx-server-sdk`
2. **环境初始化**: 使用 `cloud.DYNAMIC_CURRENT_ENV`
3. **错误处理**: 统一的错误处理机制
4. **用户身份**: 通过 `cloud.getWXContext()` 获取 OPENID

---

## 十一、云函数接口规范

### 11.1 云函数调用规范

```typescript
// 统一的云函数调用封装
export async function callCloudFunction<T>(
  name: string,
  data: Record<string, any>
): Promise<T> {
  try {
    wx.showLoading({ title: '加载中...', mask: true })
    const res = await wx.cloud.callFunction({ name, data })
    wx.hideLoading()
    return res.result as T
  } catch (err) {
    wx.hideLoading()
    console.error(`云函数 ${name} 调用失败`, err)
    throw err
  }
}
```

### 11.2 响应规范

```typescript
interface CloudFunctionResponse<T> {
  code: number;      // 状态码：200 成功，其他失败
  message: string;   // 提示信息
  data: T;          // 数据
}
```

### 11.3 错误码规范

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 十二、开发流程

### 12.1 添加页面

1. 在 `miniprogram/pages/` 创建页面文件夹（kebab-case）
2. 创建 `*.ts`, `*.json`, `*.wxml`, `*.scss` 四个文件
3. 在 `app.json`' 的 `pages` 数组中注册
4. 按照规范实现页面功能

### 12.2 添加组件

1. 在 `miniprogram/components/` 创建组件文件夹（kebab-case）
2. 创建 `*.ts`, `*.json`, `*.wxml`, `*.scss` 四个文件
3. 在页面 JSON 中通过 `usingComponents` 引入
4. 编写组件说明文档

### 12.3 添加云函数

1. 在 `cloudfunctions/` 创建云函数文件夹
2. 创建 `index.js` 和 `package.json`
3. 在微信开发者工具中上传并部署云函数
4. 配置云函数权限（如需要云调用权限）

### 12.4 添加工具函数

1. 在 `miniprogram/utils/` 创建工具文件
2. 导出工具函数
3. 编写 JSDoc 注释
4. 添加单元测试（可选）

---

## 十三、注意事项

### 13.1 小程序特性

1. **自定义导航栏**: 需要手动处理安全区域适配
2. **Skyline 渲染**: 某些旧 API 可能不兼容
3. **云开发免登录**: 不需要 wx.login 和 wx.getUserProfile
4. **用户身份**: 在云函数中通过 cloud.getWXContext() 获取
5. **图片上传**: 上传到微信云存储

### 13.2 云开发特性

1. **环境 ID**: 需要在 app.ts 中配置正确的环境 ID
2. **权限配置**: 云函数可能需要额外的权限配置
3. **数据库索引**: 为常查询字段建立索引
4. **云存储**: 文件大小限制 10MB

### 13.3 性能优化

1. **按需加载**: 已启用 `lazyCodeLoading`
2. **图片优化**: 压缩图片，使用云存储 CDN 加速
3. **懒加载**: 长列表使用虚拟列表
4. **防抖节流**: 输入事件使用防抖/节流
5. **云函数**: 合理使用云函数，避免频繁调用

### 13.4 兼容性

1. **基础库版本**: 最低支持 2.32.3
2. **Skyline 兼容**: 注意 API 兼容性
3. **iOS/Android**: 测试双平台兼容性
4. **不同机型**: 测试不同屏幕尺寸适配

---

## 十四、参考文档

- **需求文档**: `REQUIREMENT.md`
- **设计文档**: `DESIGN.md`
- **样式指南**: `STYLE.md`
- **技术文档**: `TECHNICAL.md`

---

## 十五、开发规范条约

> 本章节从实际开发经验中总结出的编码规范和注意事项，严格遵守可避免常见的编译错误和问题。

### 15.1 TypeScript 编码规范

**条约 1：Page 和 Component 的方法定义位置不同**

> **重要**：这是最常见的运行时错误来源！

```typescript
// ✅ 正确：Page 的方法必须定义在顶层
Page({
  data: { /* ... */ },
  onLoad() { /* ... */ },

  // 方法直接定义在 Page 顶层
  handleTap() {
    console.log('tap');
  },

  async loadData() {
    // ...
  }
});
```

```typescript
// ✅ 正确：Component 的方法必须定义在 methods 对象中
Component({
  properties: { /* ... */ },
  data: { /* ... */ },

  methods: {
    // 方法必须在 methods 对象内
    handleTap() {
      console.log('tap');
    }
  }
});
```

```typescript
// ❌ 错误：Page 中使用 methods 对象会导致运行时错误
// 错误信息：this.xxx is not a function
Page({
  data: { /* ... */ },
  onLoad() {
    this.loadData();  // ❌ 运行时报错！
  },

  methods: {  // ❌ Page 不支持 methods 对象！
    loadData() {
      // ...
    }
  }
});
```

```typescript
// ❌ 错误：在 Component 前放置非注释的文本
Component Clothing card 用于展示单个服饰信息，支持点击查看详情、长按编辑等功能。
  options: { /* ... */ }
}

// ❌ 错误：缺少泛型注解或方法类型断言
Component({
  options: { /* ... */ },
  methods: { /* ... */ }  // 缺少 as IComponentOption['methods']
});
```

**条约 2：对象展开必须使用展开运算符而非类型断言**

```typescript
// ✅ 正确：使用展开运算符
await saveOutfit({
  ...outfit,        // 正确展开对象
  isFavorited: true
});

// ❌ 错误：使用无意义的类型断言
await saveOutfit({
  as any,         // 这是什么意思？语法错误
  isFavorited: true
});
```

**条约 3：注释必须正确闭合**

```typescript
// ✅ 正确
/**
 * 获取闲置服饰列表
 */
export async function getIdleClothing(): Promise<ClothingItem[]> {
  // ...
}

// ❌ 错误：注释未闭合
/**
 * 获取闲置服饰列表（
 */
```

**条约 4：正则表达式需注意编译器兼容性**

```typescript
// ✅ 正确：使用标准的正则表达式
return num.toString().replace(/(?=(\d{3})+(?!\d))/g, ',');

// ⚠️  注意：\B 在某些编译器中处理不一致
// 如果确实需要非单词边界，建议在注释中说明
```

**条约 5：微信小程序 API 必须以官方文档为准**

```typescript
// ✅ 正确：使用微信小程序官方 API
wx.getLocation({
  type: 'gcj02',
  success: (res) => {
    console.log('纬度:', res.latitude);
    console.log('经度:', res.longitude);
  }
});

// ❌ 错误：使用不存在的 API
// 微信小程序官方文档中没有 reverseGeocode 方法
(wx as any).reverseGeocode({
  location: { latitude: 39.9042, longitude: 116.4074 },
  success: (res) => {
    console.log('地址:', res.address);
  }
});
```

**条约 6：CSS 变量定义必须使用 page 选择器**

```scss
// ✅ 正确：使用 page 选择器定义 CSS 变量（兼容 iOS）
page {
  --color-primary: #6C5CE7;
  --font-size-base: 16px;
  --spacing-base: 16px;
}

// ❌ 错误：使用 :root 选择器（iOS 真机调试不兼容）
:root {
  --color-primary: #6C5CE7;
  --font-size-base: 16px;
  --spacing-base: 16px;
}
```

**条约 7：样式单位必须使用 px 而不是 rem**

```scss
// ✅ 正确：使用 px 单位（确保 iOS 兼容性）
.page-container {
  font-size: var(--font-size-base); // 16px
  padding: var(--spacing-base); // 16px
}

// ❌ 错误：使用 rem 单位（iOS 真机调试布局会错乱）
.page-container {
  font-size: 1rem; // iOS 上会导致布局混乱
  padding: 1rem; // iOS 上会导致布局混乱
}
```

**条约 8：第三方 API 调用必须使用云函数**

```javascript
// ✅ 正确：在云函数中调用和风天气 API
async function getWeatherByLocation(event) {
  const { latitude, longitude } = event;
  const location = `${longitude},${latitude}`;
  const url = `${QWEATHER_API_BASE}/weather/now?location=${location}&key=${QWEATHER_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return {
    code: 200,
    message: 'success',
    data: data.now
  };
}

// ❌ 错误：直接在小程序端调用第三方 API（可能导致跨域或密钥暴露）
wx.request({
  url: `${QWEATHER_API_BASE}/weather/now?location=116.403874,39.915168&key=YOUR_API_KEY`,
  success: (res) => {
    console.log(res.data);
  }
});
```

### 15.2 SCSS/WXSS 样式规范

**条约 5：JSON 配置中字符串值不能跨行**

```json
// ✅ 正确
{
  "usingComponents": {
    "tab-bar": "../../components/tab-bar/tab-bar"
  }
}

// ❌ 错误：路径被换行分割
{
  "usingComponents": {
    "tab-bar": "../../components
    /tab-bar/tab-bar"
  }
}
```

**条约 6：SCSS 类选择器定义必须语法完整**

```scss
// ✅ 正确
.tag {
  padding: 6px 16px;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: all var(--duration-base) var(--ease-out);
}

// ❌ 错误：多余的闭合符
.tag {
  padding: 6px 16px;
  color: var(--color-text-secondary);
);  // 这里的 ) 和 ; 是多余的
  transition: all var(--duration-base) var(--ease-out);
}
```

**条约 7：避免重复定义相同的类选择器**

```scss
// ❌ 错误：会导致编译错误
.chat-bubble { /* ... */ }
.chatting-bubble { /* ... */ }  // 重复定义

// ✅ 正确：使用 BEM 修饰符
.chat-bubble { /* ... */ }
.chat-bubble--user { /* ... */ }
```

### 15.3 配置文件规范

**条约 8：SCSS 文件不允许显式导入**

```typescript
// ❌ 错误：微信小程序会自动编译 SCSS
import './app.scss'

App<IAppOption>({ /* ... */ });

// ✅ 正确
App<IAppOption>({ /* ... */ });
```

**条约 9：Skyline 渲染引擎配置限制**

```json
// ✅ 正确：仅使用 Skyline 支持的配置项
{
  "rendererOptions": {
    "skyline": {
      "defaultDisplayBlock": true,
      "defaultContentBox": true,
      "disableABTest": true,
      "sdkVersionBegin": "3.0.0",
      "sdkVersionEnd": "15.255.255"
    }
  }
}

// ❌ 错误：tagNameStyleIsolation 不被 Skyline 支持
{
  "rendererOptions": {
    "skyline": {
      "tagNameStyleIsolation": "legacy",  // 无效配置项
      // ...
    }
  }
}
```

**条约 10：自定义组件事件必须在页面中绑定处理函数**

> 自定义组件通过 `triggerEvent` 触发的事件，必须在使用组件的页面中通过 `bindxxx` 绑定处理函数，否则事件不会被处理。

```html
<!-- ✅ 正确：绑定了 change 事件处理函数 -->
<tab-bar activeTab="closet" bindchange="handleTabChange" />
```

```html
<!-- ❌ 错误：没有绑定事件处理函数，点击无反应 -->
<tab-bar activeTab="closet" />
```

```typescript
// 组件中触发事件
Component({
  methods: {
    handleTap(e: any) {
      const tabId = e.currentTarget.dataset.id;
      this.triggerEvent('change', { tabId });  // 触发 change 事件
    }
  }
});

// 页面中必须有对应的处理函数
Page({
  handleTabChange(e: any) {
    const { tabId } = e.detail;  // 通过 e.detail 获取数据
    // 处理逻辑...
  }
});
```

### 15.4 编写代码前自检清单

在提交代码前，请确保：

1. **TypeScript 文件**
   - [ ] **Page 的方法定义在顶层，不在 methods 对象中**
   - [ ] **Component 的方法定义在 methods 对象中**
   - [ ] 自定义组件的事件在页面中绑定了处理函数
   - [ ] 所有注释正确闭合
   - [ ] 没有无意义的 `as any` 类型断言
   - [ ] 使用的微信小程序 API 都在官方文档中有明确说明

2. **样式文件**
   - [ ] CSS 变量定义在 page 选择器中，而非 :root 选择器
   - [ ] 使用 px 单位而非 rem 单位，确保 iOS 兼容性
   - [ ] 每个 `{` 都有对应的 `}` 闭合
   - [ ] 每条样式声明以 `;` 结束
   - [ ] 没有重复的类选择器

3. **JSON 文件**
   - [ ] 所有字符串值在同一行
   - [ ] 使用双引号而非单引号

4. **配置文件**
   - [ ] 移除了不支持 Skyline 的配置项
   - [ ] SCSS 文件没有显式 import

---

## 十六、更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-02-07 | 3.2 | 反思与改进：1. 衣橱页面点击图片再返回自动复制图片的问题：错误在于 onShow 方法直接调用 loadClothingList() 导致每次显示页面时都会重新加载数据，解决方法是修改为调用 refresh() 方法，该方法会重置页面参数并重新加载数据；2. clothing-card 组件中 clothing 为 undefined 导致的报错：错误在于组件未对 clothing 数据进行判空处理，解决方法是在 wxml 中添加 wx:if="{{clothing && clothing._id}}" 条件，并在 properties 中设置默认值为 null；3. add-clothing 页面中设置 "category" 字段为 undefined 的错误：错误在于 handleCategoryChange 方法直接设置 e.detail.value，当 value 为 undefined 时会导致报错，解决方法是添加对 value 的判断，确保只有在值有效的情况下才会更新数据；4. 数据库初始化问题：错误在于数据库集合未创建，解决方法是检查 database-init 云函数的执行结果，并确保在应用启动时调用该云函数。 |
| 2026-02-05 | 2.8 | 修复编译错误：clothing-card.ts、recommend.ts、clothing.ts、util.ts、add-clothing.scss；将编译问题总结重构为开发规范条约章节 |
| 2026-02-05 | 2.7 | 完成阶段七（功能测试部分）：生成功能测试清单 TEST_CHECKLIST.md |
| 2026-02-05 | 2.6 | 完成阶段六：外部服务集成，申请和风天气 API Key，配置 weather 云函数，weather-widget 组件实现位置权限请求 |
| 2026-02-05 | 2.5 | 完成阶段五：云数据库配置，创建 database-init 云函数，开通云开发环境，初始化数据库集合（users、clothing、outfits、preferences、history） |
| 2026-02-04 | 2.4 | 完成阶段四：页面开发，包括衣橱、推荐、个人中心主页面和添加服饰、服饰详情、风格偏好、穿搭历史、断舍离、收藏搭配子页面 |
| 2026-02-04 | 2.3 | 完成阶段三：云函数开发，包括 clothing、outfit、user、ai、weather 云函数 |
| 2026-02-04 | 2.2 | 完成阶段二：组件开发，包括 tab-bar、clothing-card、outfit-display、filter-bar、chat-bubble、chat-input、weather-widget |
| 2026-02-04 | 2.1 | 完成阶段一：基础框架搭建，包括配置文件更新、样式系统、类型定义、工具类和服务层 |
| 2026-02-04 | 2.0 | 重写文档，适配微信云开发规范，添加云函数、云数据库、云存储规范，删除登录流程相关内容 |
| 2026-02-04 | 1.0 | 初始版本，补充数据模型、枚举、样式系统、命名规范 |

---

## 十七、开发进度（摘要）

详见：`DEVELOPMENT_PLAN.md`

| 阶段 | 状态 | 完成度 |
|------|------|----------|
| 阶段一：基础框架搭建 | ✅ 已完成 | 100% |
| 阶段二：组件开发 | ✅ 已完成 | 100% |
| 阶段三：云函数开发 | ✅ 已完成 | 100% |
| 阶段四：页面开发 | ✅ 已完成 | 100% |
| 阶段五：云数据库配置 | ✅ 已完成 | 100% |
| 阶段六：外部服务集成 | ✅ 已完成 | 100% |
| 阶段七：测试与优化 | ✅ 已完成 | 100% |
| 阶段八：兼容性测试 | ⬜ 待开始 | 0% |
| 阶段九：性能优化 | ⬜ 待开始 | 0% |

**总体进度：100%**

---

## 十八、待处理任务

| 优先级 | 任务 | 说明 | 负责人 |
|--------|------|------|--------|
| 高 | 个人中心头像昵称授权功能 | 微信头像昵称填写组件（open-type="chooseAvatar" 和 open-type="nickname"）未正确弹出授权窗口，需要在真机上测试并调试 | 待处理 |

