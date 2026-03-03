# 模块依赖关系图谱 (Module Dependency Graph)

**版本**: 1.0.0
**状态**: Draft
**原则**: 低耦合 (Low Coupling), 高内聚 (High Cohesion)

本文档明确定义了系统各模块之间的调用关系。**禁止**任何未在此文档中定义的跨模块直接调用。所有跨模块交互必须通过定义的公共接口进行。

---

## 1. 核心依赖概览

系统采用分层架构，上层依赖下层，禁止循环依赖。

```mermaid
graph TD
    %% 业务聚合层
    Orchestrator[业务编排层 (Frontend/Edge)]
    
    %% 核心业务层
    subgraph "Core Domain (核心业务)"
        OutfitService[Outfit 服务]
        AIService[AI 服务]
    end
    
    %% 基础服务层
    subgraph "Base Services (基础服务)"
        UserService[User 服务]
        ClothingService[Clothing 服务]
        WeatherService[Weather 服务]
    end
    
    %% 外部依赖
    subgraph "Infrastructure (基础设施)"
        CloudDB[(云数据库)]
        ObjectStorage[(云存储)]
        ThirdPartyAPI[外部 API (LLM/Weather)]
    end

    %% 依赖关系
    Orchestrator --> OutfitService
    Orchestrator --> AIService
    Orchestrator --> ClothingService
    Orchestrator --> UserService
    
    OutfitService --> ClothingService
    OutfitService --> UserService
    OutfitService --> AIService
    
    AIService --> ClothingService
    
    %% 基础设施访问
    OutfitService -.-> CloudDB
    UserService -.-> CloudDB
    ClothingService -.-> CloudDB
    ClothingService -.-> ObjectStorage
    WeatherService -.-> ThirdPartyAPI
    AIService -.-> ThirdPartyAPI
```

---

## 2. 详细调用契约

### 2.1 Outfit 服务 (Consumer)

`Outfit` 是核心业务聚合器，它负责编排推荐逻辑，因此需要依赖其他基础服务。

| 依赖模块 | 调用接口 (Method) | 目的 (Purpose) | 耦合度控制 |
| :--- | :--- | :--- | :--- |
| **User** | `user.getPreference` | 获取用户偏好权重以进行推荐打分。 | **只读**：Outfit 不直接修改 User 数据，只读取。 |
| **User** | `user.updatePreference` | 用户对搭配进行反馈（Favorite/Dislike）时，更新偏好权重。 | **接口隔离**：通过专用接口更新，不暴露 User 内部结构。 |
| **Clothing** | `clothing.list` | 获取用户衣橱库存作为推荐候选池。 | **数据传输对象 (DTO)**：只获取必要的服饰属性字段。 |
| **Clothing** | `clothing.markUsed` | 用户确认穿搭（Wear）后，更新单品使用统计。 | **命令模式**：发送“使用”指令，不关心具体更新逻辑。 |
| **AI** | `ai.chat` (内部逻辑) | 获取 LLM 生成的推荐文案（Narrative）。 | **功能委托**：Outfit 负责逻辑，AI 负责文案，不依赖 AI 进行决策。 |
| **Weather** | `weather.current` | 获取当前天气以进行规则过滤。 | **数据获取**：仅获取环境参数。 |

### 2.2 AI 服务 (Consumer & Provider)

`AI` 服务主要处理非结构化数据，但在对话场景下需要感知业务上下文。

| 依赖模块 | 调用接口 (Method) | 目的 (Purpose) | 耦合度控制 |
| :--- | :--- | :--- | :--- |
| **Clothing** | `clothing.getSummary` | 获取衣橱统计摘要（如：“5件上衣，3条裤子”），注入 System Prompt。 | **上下文注入**：只获取聚合后的摘要数据，不获取具体单品详情，避免上下文过大。 |

### 2.3 Clothing 服务 (Provider)

`Clothing` 是基础资源服务，**原则上不依赖其他业务模块**，只提供数据。

*   **依赖**: 无（只依赖基础设施如 DB 和 Storage）。
*   **被依赖**: Outfit, AI, User (统计)。

### 2.4 User 服务 (Provider)

`User` 是基础身份与配置服务，**原则上不依赖其他业务模块**。

*   **依赖**: 无。
*   **被依赖**: Outfit (读取/更新偏好)。

---

## 3. 循环依赖规避 (Circular Dependency Avoidance)

以下调用是**严格禁止**的，以防止逻辑死锁和高耦合：

*   ❌ **Clothing 调用 Outfit**: 服饰服务不应关心它被用于哪个搭配。搭配记录的更新应由 Outfit 服务主动处理，或通过事件总线（如果架构支持）。目前架构由 Outfit 服务负责调用 Clothing 服务更新状态。
*   ❌ **User 调用 Outfit**: 用户画像的构建应基于行为日志，而不是直接查询 Outfit 业务表。User 服务应保持独立性。
*   ❌ **AI 调用 Outfit**: AI 服务应保持无状态（Stateless），它不应直接查询历史搭配记录。历史上下文应由调用方（Frontend 或 Outfit Service）作为 `history` 参数传入。

---

## 4. 接口变更管理

任何涉及上述依赖关系的接口变更（尤其是 Provider 方的接口签名变更），必须同步更新本依赖文档，并通知所有 Consumer 方进行适配。
