/* ========================================
   风格偏好页面 - Page: Style Preference
   ======================================== */

import { getStylePreference, updateStylePreference } from '../../../services/user';

Page({
  data: {
    preference: {
      preferredColors: [] as string[],
      preferredStyles: [] as string[],
      preferredOccasions: [] as string[],
      moods: [] as string[]
    },
    autoAI: {
      colors: [] as any[],
      styles: [] as any[],
      occasions: [] as any[]
    },
    // 手动设置区的选项，确保全中文
    options: {
      colors: [
        { label: '白色', value: '白色' }, { label: '黑色', value: '黑色' },
        { label: '灰色', value: '灰色' }, { label: '蓝色', value: '蓝色' },
        { label: '红色', value: '红色' }, { label: '绿色', value: '绿色' },
        { label: '黄色', value: '黄色' }, { label: '莫兰迪色', value: '莫兰迪色' }
      ],
      styles: [
        { label: '简约', value: '简约' }, { label: '复古', value: '复古' },
        { label: '街头', value: '街头' }, { label: '优雅', value: '优雅' },
        { label: '运动', value: '运动' }, { label: '通勤', value: '通勤' },
        { label: '日系', value: '日系' }, { label: '长款', value: '长款' },
        { label: '修身', value: '修身' }, { label: '宽松', value: '宽松' }
      ],
      occasions: [
        { label: '日常', value: '日常' }, { label: '办公室', value: '办公室' },
        { label: '约会', value: '约会' }, { label: '运动', value: '运动' },
        { label: '聚会', value: '聚会' }, { label: '正式场合', value: '正式场合' },
        { label: '通勤', value: '通勤' }
      ],
      moods: [
        { label: '开心', value: '开心' }, { label: '放松', value: '放松' },
        { label: '自信', value: '自信' }, { label: '平和', value: '平和' },
        { label: '活力', value: '活力' }
      ]
    },
    loading: false
  },

  onLoad() {
    this.loadPreference();
  },

  async loadPreference() {
    try {
      this.setData({ loading: true });
      const res = await getStylePreference();
      const weights = res.weights || {};

      /**
       * 数据适配器：提取前3个高分偏好（源头已中文化，移除翻译逻辑）
       */
      const adaptData = (list: any[], weightObj: any) => {
        if (!list || !Array.isArray(list)) return [];
        return list.map(item => {
          const name = typeof item === 'string' ? item : (item.name || '');
          const score = typeof item === 'string' ? (weightObj[item] || 0) : (item.score || 0);
          return { name, score };
        }).sort((a, b) => b.score - a.score).slice(0, 3);
      };

      const colors = adaptData(res.preferredColors || [], weights.color || {});
      const styles = adaptData(res.preferredStyles || [], weights.style || {});
      const occasions = adaptData(res.preferredOccasions || [], weights.occasion || {});

      this.setData({
        preference: {
          preferredColors: colors.map(i => i.name),
          preferredStyles: styles.map(i => i.name),
          preferredOccasions: occasions.map(i => i.name),
          moods: res.moods || []
        },
        autoAI: { colors, styles, occasions },
        loading: false
      });
    } catch (err) {
      console.error('[偏好页] 加载失败', err);
      this.setData({ loading: false });
    }
  },

  handleColorChange(e: any) { this._toggle('preferredColors', e); },
  handleStyleChange(e: any) { this._toggle('preferredStyles', e); },
  handleOccasionChange(e: any) { this._toggle('preferredOccasions', e); },
  handleMoodChange(e: any) { this._toggle('moods', e); },

  _toggle(key: string, e: any) {
    const { value, selected } = e.currentTarget.dataset;
    let list = [...(this.data.preference as any)[key]];
    if (selected) {
      list = list.filter((item: string) => item !== value);
    } else {
      list.push(value);
    }
    this.setData({ [`preference.${key}`]: list });
  },

  async handleSave() {
    try {
      this.setData({ loading: true });
      await updateStylePreference(this.data.preference);
      wx.showToast({ title: '已同步', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '失败', icon: 'none' });
      this.setData({ loading: false });
    }
  }
});
