# AI OOTD 技术规格说明书 (Technical Specification)

**版本**: 1.3.0
**最后更新**: 2026-03-03
**状态**: Living Document

本文档作为 AI OOTD 项目的**唯一技术真理来源 (Single Source of Truth)**，定义了系统的核心数据流转、接口契约及状态管理逻辑，确保实现完整的业务闭环。

---

## 1. 核心业务流程 (Core Logic Flow)

### 1.1 服饰录入与智能分拣 (AI Recognition)
- **识别链路**：Camera/Album -> uploadFile -> `ai.recognize` -> cloud.getTempFileURL (HTTPS 桥接) -> Ark Vision API.
- **打标准则**：
  - **习惯学习**：AI 必须优先使用用户已有的标签库（Existing Labels）。严禁在意思相近时产生冗余新词（如“裤子”vs“长裤”）。
  - **一图多存**：AI 始终返回数组结构 `[ {...} ]`，必须主动拆分图片中的多件单品。
- **确认机制**：前端分拣清单展示 (支持横向滑动预览) -> 用户手动校对 -> `clothing.batchAdd` 批量入库。

### 1.2 风格偏好自进化机制 (Style DNA)
- **核心维度**：以“单品款式”（Style）为核心统计维度。
- **触发权重**：
  - 收藏搭配：+3分
  - 标记穿过：+2分
  - 标记喜欢：+1分
- **数据流**：单品特征提取 -> `user.incrementPreferenceWeights` 增量更新 -> 提炼 Top 3 偏好快照。

---

## 2. UI/UX 视觉与交互规范 (Design Language)

### 2.1 品牌视觉：Frosted Chic (磨砂时尚)
- **配色系统**：
  - 系统底色: `#F2F2F7` (Cool Gray)
  - 品牌高亮色: `#7873f5` (Lavender Accent, 来源于 TabBar 激活态)
  - 核心文本: `#1C1C1E`
- **形态规范**：
  - 交互胶囊/按钮: `100rpx` (Pill Shape)
  - 内容卡片: `32rpx` (Large Radius)
  - 统一阴影: `0 16rpx 40rpx rgba(0, 0, 0, 0.04)`

### 2.2 极致居中与对齐准则
- **图标绘制**：对于需要几何居中的图标（如 `+` 号），禁止使用文本符号，强制使用 CSS 伪元素绘图 + `translate(-50%, -50%)`。
- **筛选器对齐**：标题（品类/季节等）必须与右侧滚动标签组在垂直物理中心线严格重合。

---

## 3. 技术架构契约 (Technical Contracts)

### 3.1 身份识别铁律 (Identity Passthrough)
- **云间互调**：发起方必须显式在 `event` 中传递 `openid`。
- **兜底策略**：统一使用 `wxContext.OPENID || event.openid || event.userInfo.openId`。

### 3.2 源头中文化与数据一致性
- **零字典设计**：数据库严禁存储英文编码，所有属性（品类、款式等）均明文存储中文，彻底消除前端翻译依赖。

---

## 4. 失败案例反思库 (Post-Mortem)

### 案例 1：云函数 403 身份危机 (2026-03-03)
- **现象**：跨函数调用时未传递 OpenID 导致数据库权限受阻。
- **修复**：在全局 `variables` 中确立身份传递规范，并增强了 `user` 函数的兼容性。

### 案例 2：服饰识别解析崩溃 (2026-03-03)
- **现象**：由于无法访问 `cloud://` 协议及无法处理 AI 的多余文字，导致识别频繁报错。
- **修复**：引入 HTTPS 临时链接转换，并升级 `parseJSONSafely` 采用正则精准提取 JSON 部分。

---

## 5. 工程维护协议 (Maintenance Protocol)
- **改动必查**：修改任何 Action 返回结构前，必须执行全局 `grep` 同步更新所有前端调用点。
- **备份 Prompt**：核心 AI Prompt 必须在 `AI_SERVICE_CONFIG.md` 中进行版本化备份，防止重构时误删。
