/**
 * 规则过滤器 (Rule Filter)
 * 职责: 执行硬性过滤，排除绝对不符合当前环境的单品。
 */

/**
 * 根据天气和季节过滤服饰
 * @param {Array} clothingList 服饰列表
 * @param {Object} weather 天气对象 { temp, condition }
 * @returns {Array} 过滤后的列表
 */
function filterByWeather(clothingList, weather) {
  if (!weather || typeof weather.temp !== 'number') return clothingList;

  const { temp } = weather;
  
  return clothingList.filter(item => {
    // 1. 基础季节过滤
    // 如果温度高 (>25), 排除冬装
    if (temp > 25 && item.season && item.season.includes('winter')) return false;
    // 如果温度低 (<10), 排除夏装
    if (temp < 10 && item.season && item.season.includes('summer')) return false;

    // 2. 状态过滤 (软删除/脏衣逻辑预留)
    if (item.isDeleted) return false;

    return true;
  });
}

module.exports = {
  filterByWeather
};
