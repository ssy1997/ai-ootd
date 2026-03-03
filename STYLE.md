# AI OOTD 小程序 UI 风格指南

## 一、设计理念

- **高端杂志感**: 采用杂志排版美学，大面积留白，精致字体
- **科技极简**: 极简设计，突出内容本身，科技感十足
- **动态响应**: 流式布局，自适应不同屏幕尺寸，不使用固定宽度
- **深邃紫调**: 高端紫色主题(#6C5CE7)，营造专业时尚感

---

## 二、颜色系统

### 2.1 主题色（深邃紫系）

| 变量名 | 颜色值 | 用途 |
|--------|--------|------|
| `--color-primary` | `#6C5CE7` | 主色调，品牌色、按钮 |
| `--color-primary-dark` | `#4A45B8` | 主色调深色，Hover状态 |
| `--color-primary-light` | `#E8E7F5` | 主色调浅色，背景装饰 |
| `--color-secondary` | `#8A7FB0` | 辅主色，渐变用 |
| `--color-accent` | `#FF6B9D` | 强调色，收藏、喜欢 |

### 2.2 背景色（浅灰/米白系）

| 变量名 | 颜色值 | 用途 |
|--------|--------|------|
| `--color-bg` | `#F5F5F5` | 页面背景（米白） |
| `--color-bg-white` | `#FFFFFF` | 卡片背景（纯白） |
| `--color-bg-purple` | `#FAF9FF` | 紫色微调背景 |
| `--color-bg-gray` | `#F0F0F0` | 次要背景，AI 消息 |
| `--color-divider` | `#E8E8E8` | 分割线，极淡 |

### 2.3 文字色

| 变量名 | 颜色值 | 用途 |
|--------|--------|------|
| `--color-text-primary` | `#1A1A1A` | 主要文字 |
| `--color-text-secondary` | `#666666` | 次要文字 |
| `--color-text-tertiary` | `#999999` | 辅助文字 |
| `--color-text-purple` | `#6C5CE7` | 品牌文字 |

### 2.4 功能色

| 变量名 | 颜色值 | 用途 |
|--------|--------|------|
| `--color-success` | `#52C41A` | 成功状态 |
| `--color-warning` | `#FAAD14` | 警告状态 |
| `--color-error` | `#EF4444` | 错误状态 |
| `--color-info` | `#6C5CE7` | 信息提示（品牌色） |

### 2.5 阴影色

| 变量名 | 颜色值 | 用途 |
|--------|--------|------|
| `--color-shadow` | `rgba(0, 0, 0, 0.06)` | 轻阴影 |
| `--color-shadow-strong` | `rgba(0, 0, 0, 0.12)` | 强阴影 |
| `--color-shadow-purple` | `rgba(108, 92, 231, 0.15)` | 紫色阴影 |

### 2.6 透明色

| 变量名 | 颜色值 | 用途 |
|--------|--------|------|
| `--color-mask` | `rgba(0, 0, 0, 0.5)` | 遮罩层 |
| `--color-mask-light` | `rgba(0, 0, 0, 0.3)` | 浅遮罩 |

---

## 三、字体系统

### 3.1 字体家族

```scss
--font-family-base: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
--font-family-number: 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
--font-family-display: 'Playfair Display', 'Georgia', serif; // 标题用衬线体，杂志感
```

### 3.2 字体大小（使用 rem 单位，支持动态缩放）

| 变量名 | 大小 | 用途 |
|--------|------|------|
| `--font-size-xs` | `0.625rem` | 标签文字 |
| `--font-size-sm` | `0.75rem` | 辅助文字 |
| `--font-size-base` | `0.8125rem` | 正文 |
| `--font-size-lg` | `0.875rem` | 次级标题 |
| `--font-size-xl` | `1rem` | 页面标题 |
| `--font-size-xxl` | `1.25rem` | 大标题 |

### 3.3 字重

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--font-weight-normal` | `400` | 正文 |
| `--font-weight-medium` | `500` | 次级强调 |
| `--font-weight-semibold` | `600` | 较强强调 |
| `--font-weight-bold` | `700` | 标题 |

### 3.4 行高

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--line-height-tight` | `1.2` | 紧凑行高 |
| `--line-height-base` | `1.6` | 正常行高（杂志排版） |
| `--line-height-loose` | `1.8` | 宽松行高 |

---

## 四、间距系统（使用 rem 单位）

### 4.1 基础间距

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--spacing-0` | `0` | 无间距 |
| `--spacing-xs` | `0.25rem` | 极小间距 |
| `--spacing-sm` | `0.5rem` | 小间距 |
| `--spacing-base` | `1rem` | 基础间距 |
| `--spacing-lg` | `1.5rem` | 大间距 |
| `--spacing-xl` | `2rem` | 超大间距 |
| `--spacing-xxl` | `3rem` | 特大间距 |

### 4.2 页面边距（响应式）

```scss
.page {
  padding: var(--spacing-base);

  // 大屏增加边距
  @media (min-width: 480px) {
    padding: var(--spacing-lg);
  }
}
```

### 4.3 卡片内边距

```scss
.card {
  padding: var(--spacing-sm);
}
```

---

## 五、圆角系统

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--radius-none` | `0` | 无圆角 |
| `--radius-sm` | `0.25rem` | 小圆角 |
| `--radius-base` | `0.5rem` | 基础圆角 |
| `--radius-lg` | `0.75rem` | 大圆角 |
| `--radius-xl` | `1rem` | 超大圆角 |
| `--radius-full` | `999px` | 圆形 |

---

## 六、阴影系统

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--shadow-xs` | `0 1px 2px var(--color-shadow)` | 极小阴影 |
| `--shadow-sm` | `0 2px 4px var(--color-shadow)` | 小阴影 |
| `--shadow-base` | `0 4px 12px var(--color-shadow)` | 基础阴影 |
| `--shadow-lg` | `0 8px 24px var(--color-shadow)` | 大阴影 |
| `--shadow-purple` | `0 4px 16px var(--color-shadow-purple)` | 紫色阴影（品牌感） |

---

## 七、布局系统（动态响应）

### 7.1 容器最大宽度

```scss
// 不设置固定宽度，使用流式布局
.container {
  width: 100%;
  max-width: none;
}
```

### 7.2 Grid 网格布局（动态列数）

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

### 7.3 Flex 弹性布局

```scss
// 使用 flex 实现自适应
.flex-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.flex-col {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
```

### 7.4 比例自适应

```scss
// 服饰图片 - 保持正方形比例
.clothing-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
```

---

## 八、组件样式规范

### 8.1 导航栏 (navigation-bar)

```scss
.navigation-bar {
  height: 44px;
  background: var(--color-bg-white);
  color: var(--color-text-purple);
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(10px); // 毛玻璃效果
}
```

### 8.2 Tab 切换

```scss
.tab-bar {
  height: 56px;
  background: var(--color-bg-white);
  border-top: 1px solid var(--color-divider);
  backdrop-filter: blur(10px);

  .tab-item {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);

    &.active {
      color: var(--color-primary);
      font-weight: var(--font-weight-semibold);
    }
  }
}
```

### 8.3 服饰卡片 (clothing-card)

```scss
.clothing-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform var(--duration-base), box-shadow var(--duration-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .image {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }

  .info {
    padding: var(--spacing-sm);

    .name {
      font-size: var(--font-size-base);
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
    }

    .count {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-xs);
    }
  }
}
```

### 8.4 AI 消息气泡

```scss
// AI 消息（左侧）
.ai-message {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm);
  margin-left: 0;
  margin-right: 40px;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  box-shadow: var(--shadow-xs);
}

// 用户消息（右侧）
.user-message {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl);
  margin-left: 40px;
  margin-right: 0;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  box-shadow: var(--shadow-purple);
}
```

### 8.5 穿搭展示 (outfit-display)

```scss
.outfit-display {
  background: var(--color-bg-white);
  border-radius: var(--radius-base);
  padding: var(--spacing-base);
  box-shadow: var(--shadow-purple);
  margin: var(--spacing-sm) 0;

  .items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);

    @media (min-width: 400px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .actions {
    margin-top: var(--spacing-base);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .action-btn {
    background: var(--color-bg);
    border: 1px solid var(--color-divider);
    border-radius: var(--radius-base);
    padding: var(--spacing-sm);
    color: var(--color-text-purple);
    font-size: var(--font-size-base);
    text-align: center;
    transition: all var(--duration-base);

    &:active {
      background: var(--color-bg-purple);
      border-color: var(--color-primary);
    }

    &.primary {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      border-color: transparent;
      color: white;
      box-shadow: var(--shadow-purple);
    }
  }
}
```

### 8.6 快捷回复按钮

```scss
.quick-reply {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-base);
  background: var(--color-bg);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-lg);
  color: var(--color-text-purple);
  font-size: var(--font-size-base);
  margin: var(--spacing-xs);
  transition: all var(--duration-fast);

  &:active {
    background: var(--color-bg-purple);
    border-color: var(--color-primary);
    transform: scale(0.98);
  }
}
```

### 8.7 筛选栏 (filter-bar)

```scss
.filter-bar {
  background: var(--color-bg-white);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-divider);

  .search-input {
    background: var(--color-bg);
    border-radius: var(--radius-base);
    padding: var(--spacing-sm);
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
    width: 100%;
  }

  .filter-tags {
    margin-top: var(--spacing-sm);
    display: flex;
    gap: var(--spacing-xs);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .filter-tag {
    white-space: nowrap;
  }
}
```

### 8.8 按钮样式

```scss
// 主要按钮（紫色渐变）
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
  border-radius: var(--radius-base);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-purple);
  transition: all var(--duration-base);

  &:active {
    opacity: 0.8;
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    background: var(--color-divider);
    box-shadow: none;
  }
}

// 次要按钮
.btn-secondary {
  background: var(--color-bg-white);
  color: var(--color-text-purple);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-base);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  transition: all var(--duration-base);

  &:active {
    background: var(--color-bg-purple);
    border-color: var(--color-primary);
  }
}

// 文字按钮
.btn-text {
  color: var(--color-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-fast);

  &:active {
    opacity: 0.6;
  }
}
```

### 8.9 输入框样式

```scss
.input {
  background: var(--color-bg);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-base);
  padding: var(--spacing-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  width: 100%;
  transition: border-color var(--duration-base);

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
}
```

---

## 九、动画效果

### 9.1 动画时长

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--duration-fast` | `200ms` | 快速动画 |
| `--duration-base` | `300ms` | 基础动画 |
| `--duration-slow` | `500ms` | 慢速动画 |

### 9.2 缓动函数

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | 缓入 |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | 缓出 |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | 缓入缓出 |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | 弹跳效果 |

### 9.3 点击反馈

```scss
.clickable {
  transition: opacity var(--duration-fast), transform var(--duration-fast);

  &:active {
    opacity: 0.7;
    transform: scale(0.98);
  }
}
```

### 9.4 淡入动画

```scss
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out);
}

.fade-in-scale {
  animation: fadeInScale var(--duration-base) var(--ease-out);
}
```

### 9.5 Loading 动画

```scss
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-divider);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.loading-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
```

### 9.6 AI 打字效果

```typescript
// 逐字显示文本
export async function typewriter(element: any, text: string, speed = 50) {
  element.innerText = '';
  for (let i = 0; i < text.length; i++) {
    element.innerText += text[i];
    await new Promise(resolve => setTimeout(resolve, speed));
  }
}
```

---

## 十、图标规范

### 10.1 图标尺寸（使用 rem）

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `--icon-size-xs` | `0.75rem` | 极小图标 |
| `--icon-size-sm` | `1rem` | 小图标 |
| `--icon-size-base` | `1.25rem` | 基础图标 |
| `--icon-size-lg` | `1.5rem` | 大图标 |
| `--icon-size-xl` | `2rem` | 超大图标 |

### 10.2 图标颜色

| 变量名 | 颜色值 | 用途 |
|--------|--------|------|
| `--icon-color-primary` | `var(--color-primary)` | 主图标 |
| `--icon-color-secondary` | `var(--color-text-secondary)` | 次要图标 |
| `--icon-color-accent` | `var(--color-accent)` | 强调图标 |

### 10.3 常用图标

| 图标 | 用途 |
|------|------|
| 📷 | 添加、拍照、上传 |
| 🔍 | 搜索 |
| 🏷️ | 标签、分类 |
| ✏️ | 编辑 |
| ❤️ | 收藏 |
| 💾 | 保存 |
| ❤ (空心) | 未收藏 |
| 😊 | 喜欢 |
| 😐 | 一般 |
| ☹️ | 不喜欢 |
| ☀️ | 天气-晴 |
| 🌧️ | 天气-雨 |
| ☁️ | 天气-阴 |
| 📍 | 位置 |
| 🤗 | AI 表情 |
| ✨ | 效果 |

---

## 十一、图片规范

### 11.1 图片比例

| 类型 | 比例 | 用途 |
|------|------|------|
| `aspect-square` | `1:1` | 正方形（服饰图片） |
| `aspect-portrait` | `3:4` | 竖向（穿搭展示） |
| `aspect-landscape` | `16:9` | 横向（横幅图） |

### 11.2 图片尺寸（使用百分比，不固定）

```scss
// 所有图片使用百分比宽度，自适应容器
.image {
  width: 100%;
  height: auto;
}
```

### 11.3 图片加载

```scss
.image-container {
  background: var(--color-bg-gray);
  border-radius: var(--radius-base);
  overflow: hidden;
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity var(--duration-base);

    &.loading {
      opacity: 0;
    }
  }

  .loading-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
```

---

## 十二、全局样式变量

```scss
// 全局变量定义，放在 app.scss 中
:root {
  // 颜色
  --color-primary: #6C5CE7;
  --color-primary-dark: #4A45B8;
  --color-primary-light: #E8E7F5;
  --color-secondary: #8A7FB0;
  --color-accent: #FF6B9D;

  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-text-purple: #6C5CE7;

  --color-bg: #F5F5F5;
  --color-bg-white: #FFFFFF;
  --color-bg-purple: #FAF9FF;
  --color-bg-gray: #F0F0F0;
  --color-divider: #E8E8E8;

  --color-success: #52C41A;
  --color-warning: #FAAD14;
  --color-error: #EF4444;
  --color-info: #6C5CE7;

  --color-shadow: rgba(0, 0, 0, 0.06);
  --color-shadow-strong: rgba(0, 0, 0, 0.12);
  --color-shadow-purple: rgba(108, 92, 231, 0.15);
  --color-mask: rgba(0, 0, 0, 0.5);
  --color-mask-light: rgba(0, 0, 0, 0.3);

  // 字体
  --font-family-base: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --font-family-number: 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  --font-family-display: 'Playfair Display', 'Georgia', serif;

  --font-size-xs: 0.625rem;
  --font-size-sm: 0.75rem;
  --font-size-base: 0.8125rem;
  --font-size-lg: 0.875rem;
  --font-size-xl: 1rem;
  --font-size-xxl: 1.25rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-base: 1.6;
  --line-height-loose: 1.8;

  // 间距
  --spacing-0: 0;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-base: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 3rem;

  // 圆角
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-base: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 999px;

  // 阴影
  --shadow-xs: 0 1px 2px var(--color-shadow);
  --shadow-sm: 0 2px 4px var(--color-shadow);
  --shadow-base: 0 4px 12px var(--color-shadow);
  --shadow-lg: 0 8px 24px var(--color-shadow);
  --shadow-purple: 0 4px 16px var(--color-shadow-purple);

  // 动画
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;

  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  // 图标
  --icon-size-xs: 0.75rem;
  --icon-size-sm: 1rem;
  --icon-size-base: 1.25rem;
  --icon-size-lg: 1.5rem;
  --icon-size-xl: 2rem;
}
```

---

## 十三、使用示例

### 13.1 在组件中使用

```scss
// 组件样式
.my-component {
  background: var(--color-bg-white);
  padding: var(--spacing-base);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
  width: 100%; // 使用百分比宽度

  .title {
    color: var(--color-text-purple);
    font-family: var(--font-family-display);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-sm);
  }

  .text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
  }

  .button {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: white;
    border-radius: var(--radius-base);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--shadow-purple);
    transition: all var(--duration-base);

    &:active {
      opacity: 0.8;
      transform: translateY(1px);
    }
  }
}
```

### 13.2 在 TypeScript 中使用

```typescript
// 定义样式变量常量
export const STYLES = {
  colors: {
    primary: '#6C5CE7',
    secondary: '#8A7FB0',
    accent: '#FF6B9D',
    bg: '#F5F5F5',
  },
  spacing: {
    xs: 0.25,
    sm: 0.5,
    base: 1,
    lg: 1.5,
  },
  fontSize: {
    sm: 0.75,
    base: 0.8125,
    lg: 0.875,
    xl: 1,
  },
};
```

---

## 十四、响应式适配

### 14.1 安全区域

```scss
.page {
  padding: var(--spacing-base);
  padding-top: calc(var(--spacing-base) + env(safe-area-inset-top));
  padding-bottom: calc(var(--spacing-base) + env(safe-area-inset-bottom));
}
```

### 14.2 不同屏幕尺寸（动态列数）

```scss
// 默认（小屏）
.clothing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

// 中屏
@media (min-width: 400px) {
  .clothing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

// 大屏
@media (min-width: 540px) {
  .clothing-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 14.3 横竖屏适配

```scss
// 竖屏
@media (orientation: portrait) {
  .outfit-display {
    .items {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

// 横屏
@media (orientation: landscape) {
  .outfit-display {
    .items {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}
```

---

## 十五、深色模式（可选）

```scss
// 深色模式变量
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #CCCCCC;
    --color-text-tertiary: #999999;

    --color-bg: #1A1A1A;
    --color-bg-white: #2C2C2C;
    --color-bg-purple: #2A2A3A;
    --color-bg-gray: #3A3A3A;
    --color-divider: #404040;
  }
}
```

---

## 十六、设计资源

- **设计稿**: Figma/Sketch 设计文件（使用流式布局，不设置固定宽度）
- **图标库**: 使用微信小程序原生图标或 IconFont
- **字体**: 使用系统字体，标题可使用 Playfair Display 增强杂志感
- **图片**: 建议使用 WebP 格式，压缩至合适大小

---

## 十十七、开发规范

### 17.1 样式文件组织

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

### 17.2 样式命名规范

- 使用 BEM 命名法
- 类名使用小写字母和连字符
- 避免缩写，保持语义清晰

```scss
// BEM 示例
.card { }                   // Block
.card__header { }             // Element
.card__body { }               // Element
.card--active { }             // Modifier
.card__header--highlight { }   // Modifier
```

### 17.3 样式复用

优先使用 mixin 复用样式

```scss
// mixins.scss
@mixin button($bg: var(--color-primary)) {
  background: $bg;
  color: white;
  border-radius: var(--radius-base);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  width: 100%;
}

// 使用
.btn-primary {
  @include button(linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%));
}

.btn-secondary {
  @include button(var(--color-bg-white));
}
```

### 17.4 响应式设计原则

1. **使用相对单位**: 优先使用 rem、em、百分比
2. **流式布局**: 使用 Grid 和 Flex，不设置固定宽度
3. **动态列数**: 根据屏幕尺寸自动调整列数
4. **内容优先**: 确保内容在小屏上完整显示
5. **渐进增强**: 先保证基础功能，再添加响应式优化
