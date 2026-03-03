# 架构审计与重构计划 (Architecture Audit & Reset Plan)

**日期**: 2026-02-12
**状态**: Approved

基于 `TECHNICAL_SPEC.md` 对现有代码库进行的全量扫描，发现了以下关键偏离点与架构缺陷。本文件定义了后续的重构路线图。

---

## 1. 核心偏离点分析 (Critical Deviations)

### 1.1 数据闭环断裂 (Broken Feedback Loop)
*   **Spec 要求**: 用户行为（Wear/Favorite）必须触发 `User` 偏好权重更新和 `Clothing` 库存状态更新。
*   **当前现状**:
    *   `outfit/index.js` 中的 `submitFeedback` 仅仅是在 `feedback` 集合插入一条记录，数据变成了“死数据”，未反哺推荐算法。
    *   `favoriteOutfit` 仅更新 `isFavorited` 字段，未提取特征（如颜色、风格）来更新用户偏好。
*   **影响**: 推荐系统无法“越用越懂你”，永远停留在冷启动阶段。

### 1.2 上下文缺失 (Context Gap)
*   **Spec 要求**: AI 对话 (`ai.chat`) 必须感知用户库存（Inventory Aware）。
*   **当前现状**:
    *   `ai/index.js` 中的 `chatWithAI` 使用了通用的 System Prompt，未查询 `clothing` 集合。AI 不知道用户有什么衣服，只能给出“建议穿白色T恤”这种通用建议，而不是“穿你那件 Uniqlo 白T”。
*   **影响**: 对话体验割裂，AI 无法充当真正的私人管家。

### 1.3 推荐逻辑分裂 (Split Brain Logic)
*   **Spec 要求**: 统一的推荐管道：`Context -> Rules -> Scoring -> AI Narrative`。
*   **当前现状**:
    *   `outfit/index.js` 中的 `getRecommendation` 实现了一套基于规则的硬编码逻辑（JS 代码）。
    *   `ai/index.js` 中的 `recommendOutfit` 实现了另一套基于 LLM 的逻辑（Prompt）。
    *   两者逻辑不通，前端调用混乱。
*   **影响**: 维护成本高，规则不一致。

---

## 2. 模块解耦与职责重划 (Decoupling Plan)

为了修复上述问题，需要重新界定云函数的职责边界。

### 2.1 Outfit 服务 (`cloudfunctions/outfit`)
*   **Remove**: 移除复杂的推荐算法逻辑（硬编码规则）。
*   **Add**: 增加 `wear` 动作处理。
*   **Refactor**: 将推荐逻辑下沉到 `Recommender` 模块（可以是独立云函数或 Lib），`outfit` 只负责数据存取和简单的 CRUD。

### 2.2 AI 服务 (`cloudfunctions/ai`)
*   **Enhance**: `chat` 接口必须接受 `inventorySummary` 参数，或在内部先查询 `clothing` 聚合数据。
*   **Focus**: 专注于“非结构化数据处理”（生成文案、识别图片），而非业务逻辑控制。

### 2.3 User 服务 (`cloudfunctions/user`)
*   **Add**: 实现 `updatePreferenceWeights(features)` 内部方法，用于被 `outfit` 服务调用。

---

## 3. 重构路线图 (Refactoring Roadmap)

### 阶段一：打通数据闭环 (The Loop)
1.  **重构 `outfit.feedback`**:
    *   实现 `action: 'wear'`：原子化更新 `clothing.usageCount`。
    *   实现 `action: 'favorite'`：提取 Outfit 特征，调用 `user.updatePreference`。
2.  **统一推荐入口**:
    *   废弃 `ai.recommendOutfit`。
    *   在 `outfit.getRecommendation` 中，先执行规则筛选，再调用 `ai` 生成润色文案，最后返回结构化数据。

### 阶段二：增强 AI 上下文 (Context Injection)
1.  **实现 `clothing.getInventorySummary`**:
    *   聚合查询用户衣橱（Top N 品类、颜色分布）。
2.  **升级 `ai.chat`**:
    *   在 System Prompt 中注入上述摘要。

### 阶段三：规范化数据结构
1.  **数据迁移**: 确保所有 `clothing` 记录都有 `stats` 字段（`useCount`, `lastWornDate`）。
2.  **索引优化**: 为 `clothing.openid` + `category` 建立复合索引，加速筛选。

---

## 4. 重构原则 (Refactoring Principles)

在执行重构时，请严格遵守以下原则：

*   **重写优于修补 (Rewrite over Patch)**: 识别旧代码中哪些逻辑是可以保留的（如基础 CRUD），哪些必须废弃以符合新的全局数据流。对于不符合新架构的代码，请大胆重写，**严禁在烂代码上打补丁**。
*   **单一职责**: 确保每个函数只做一件事，避免“上帝函数”。
*   **接口隔离**: 严格遵守 `API_INVENTORY.md` 定义的接口契约。

---

## 5. 下一步行动 (Next Steps)

请按照 **阶段一：打通数据闭环** 开始执行，优先修复 `cloudfunctions/outfit/index.js` 中的反馈处理逻辑。
