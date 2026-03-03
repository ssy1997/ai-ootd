/**
 * 评分引擎 (Scoring Engine)
 * 职责: 对候选单品进行加权打分，实现个性化排序。
 */

/**
 * 为单件服饰计算分数
 * @param {Object} item 服饰对象
 * @param {Object} context 上下文 (mood, occasion, preferences)
 * @returns {number} 分数 (0-100)
 */
function calculateScore(item, context) {
  const { mood, occasion, preferences } = context;
  let score = 50; // 基础分
  let logs = { color: 0, style: 0, occasion: 0, usage: 0 };

  // 1. 偏好权重匹配 (基于 User 服务的权重数据)
  if (preferences && preferences.weights) {
    const { color = {}, style = {}, occasion: occWeights = {} } = preferences.weights;
    
    // 颜色加分
    if (item.color) {
      const colors = Array.isArray(item.color) ? item.color : [item.color];
      colors.forEach(c => {
        if (color[c]) {
          const bonus = color[c] * 2;
          score += bonus;
          logs.color += bonus;
        }
      });
    }
    
    // 风格加分
    if (item.style) {
      const styles = Array.isArray(item.style) ? item.style : [item.style];
      styles.forEach(s => {
        if (style[s]) {
          const bonus = style[s] * 2;
          score += bonus;
          logs.style += bonus;
        }
      });
    }
  }

  // 2. 场景匹配
  if (occasion && item.occasion && item.occasion.includes(occasion)) {
    score += 20;
    logs.occasion += 20;
  }

  // 3. 使用频率负反馈 (鼓励尝试新衣服)
  if (item.useCount) {
    const penalty = Math.min(item.useCount, 15);
    score -= penalty;
    logs.usage -= penalty;
  }

  // 4. 随机因子 (保持新鲜感)
  score += Math.random() * 10;

  // console.log(`[评分详情] ID:${item._id.substr(-4)}, 分数:${score.toFixed(1)}, 明细:${JSON.stringify(logs)}`);
  return score;
}

/**
 * 对列表进行排序并返回最优选
 * @param {Array} list 服饰池
 * @param {Object} context 上下文
 * @returns {Object|null} 最优单品
 */
function pickBest(list, context) {
  if (!list || list.length === 0) return null;
  
  const scoredList = list.map(item => ({
    item,
    score: calculateScore(item, context)
  }));

  scoredList.sort((a, b) => b.score - a.score);
  
  const best = scoredList[0];
  console.log(`[推荐打分] 分支:${best.item.category}, 候选数量:${list.length}, 最终选中ID:${best.item._id.substr(-4)}, 分数:${best.score.toFixed(1)}`);
  
  return best.item;
}

module.exports = {
  calculateScore,
  pickBest
};
