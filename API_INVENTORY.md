# AI OOTD 核心接口清单 (API Inventory)

**版本**: 1.0.0
**状态**: Draft
**基准文档**: TECHNICAL_SPEC.md

本文档列出了系统重构后的核心接口清单，明确了模块间交互的输入输出标准。所有开发工作必须严格遵守此契约。

---

## 1. Outfit 服务 (cloudfunctions/outfit)

核心业务逻辑服务，负责推荐生成和行为反馈。

### 1.1 `recommend` (获取推荐)
*   **Method**: `outfit.recommend`
*   **Input**:
    ```typescript
    {
      weather: {
        temp: number;       // 温度 (摄氏度)
        condition: string;  // 天气状况 (e.g. "Sunny")
      },
      userContext: {
        mood?: 'happy' | 'calm' | 'lively' | 'lazy'; // 用户心情
        occasion?: 'casual' | 'formal' | 'sport';    // 场合
      },
      limit?: number; // 返回推荐数量，默认 1
    }
    ```
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        outfit: {
          _id?: string;          // 若已保存则有 ID
          items: ClothingItem[]; // 完整的服饰对象列表
          tags: string[];        // 推荐标签 (e.g. "保暖", "通勤")
          reason: string;        // AI 生成的推荐理由
          score: number;         // 匹配度分数 (0-100)
        }
      }
    }
    ```

### 1.2 `feedback` (行为反馈)
*   **Method**: `outfit.feedback`
*   **Input**:
    ```typescript
    {
      outfitId: string;
      type: 'wear' | 'favorite' | 'unfavorite' | 'like' | 'unlike' | 'skip';
    }
    ```
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        inventoryUpdated: number; // 更新库存数量 (wear action)
        preferenceUpdated: boolean; // 是否更新了偏好
        currentWeight: number; // 该搭配当前已应用的总权重 (0-3)
      }
    }
    ```
*   **Logic (Stateful Toggle & Diffing)**:
    *   **分值阶梯**: 收藏 (**3**), 确认穿搭 (**2**), 点赞 (**1**), 无 (**0**)。
    *   **双向切换 (Toggle)**: 再次点击已激活的“喜欢”或“收藏”会触发 `unlike` 或 `unfavorite`。
    *   **差值计算 (Score Diffing)**: 系统取当前激活状态的最高分为 `NewMaxScore`。
    *   **公式**: `本次偏好增量 (Delta) = NewMaxScore - AppliedWeight`。
    *   **权重回退**: 当取消操作导致状态降级时（如取消收藏且未穿过），Delta 为负值，实现自动扣分。
    *   `skip`: 换一套，权重 **-0.5**。不参与差值计算，属于单次即时惩罚。

### 1.3 `history` (获取历史)
*   **Method**: `outfit.list`
*   **Input**:
    ```typescript
    {
      page: number;
      pageSize: number;
      filter?: {
        isFavorited?: boolean;
        dateRange?: { start: number, end: number };
      }
    }
    ```
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        list: Outfit[];
        total: number;
        hasMore: boolean;
      }
    }
    ```

---

## 2. AI 服务 (cloudfunctions/ai)

负责非结构化数据处理（NLP & CV）。

### 2.1 `chat` (智能对话)
*   **Method**: `ai.chat`
*   **Input**:
    ```typescript
    {
      message: string;        // 用户输入
      history: ChatMessage[]; // 对话历史 (最近 10 条)
      context: {              // 上下文注入
        inventorySummary: string; // 库存摘要 (e.g. "Top: 5, Bottom: 3")
        weather: string;          // 天气描述
      }
    }
    ```
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        reply: string;        // AI 回复内容
        suggestions: string[]; // 下一步建议 (Quick Replies)
        action?: string;      // 触发客户端动作 (e.g. "show_closet")
      }
    }
    ```

### 2.2 `recognize` (图像识别)
*   **Method**: `ai.recognize`
*   **Input**:
    ```typescript
    {
      imageUrl: string; // 云存储 FileID 或 HTTP URL
    }
    ```
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        isClothing: boolean;
        category?: string;
        color?: string[];
        season?: string[];
        style?: string[];
        material?: string[];
        confidence: number;
      }
    }
    ```

---

## 3. User 服务 (cloudfunctions/user)

负责用户数据与偏好管理。

### 3.1 `updatePreference` (更新偏好权重)
*   **Method**: `user.updatePreference` (内部调用为主)
*   **Input**:
    ```typescript
    {
      features: {
        colors: string[];
        styles: string[];
        categories: string[];
      },
      weightDelta: number; // 权重增量 (e.g. +1, -1)
    }
    ```
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        updatedWeights: object; // 更新后的权重快照
      }
    }
    ```

### 3.2 `getStats` (用户统计)
*   **Method**: `user.getStats`
*   **Input**: `null`
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        clothingCount: number;
        outfitCount: number;
        favoriteCount: number;
        idleCount: number; // 闲置数量
      }
    }
    ```

---

## 4. Clothing 服务 (cloudfunctions/clothing)

负责服饰库存的基础 CRUD。

### 4.1 `updateStats` (更新统计)
*   **Method**: `clothing.markUsed`
*   **Input**:
    ```typescript
    {
      id: string; // 服饰 ID
    }
    ```
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        usageCount: number; // 更新后的使用次数
        lastWornDate: Date;
      }
    }
    ```

### 4.2 `getInventorySummary` (获取库存摘要 - 用于 AI 上下文)
*   **Method**: `clothing.getSummary` (新增)
*   **Input**: `null`
*   **Output**:
    ```typescript
    {
      code: 200,
      message: "success",
      data: {
        total: number;
        byCategory: { [key: string]: number }; // e.g. { top: 10, bottom: 5 }
        topColors: string[]; // e.g. ["black", "white"]
      }
    }
    ```
