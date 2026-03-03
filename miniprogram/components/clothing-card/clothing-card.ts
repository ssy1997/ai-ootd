/* ========================================
   Clothing Card 组件 - clothing-card.ts
   ======================================== */

import type {
  IComponentOption,
  ClothingItem
} from '../../types/index';

Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'shared'
  },

  properties: {
    // 服饰数据
    clothing: {
      type: Object,
      value: null as any
    },
    // 是否显示选中状态
    selected: {
      type: Boolean,
      value: false
    },
    // 是否显示使用次数
    showUseCount: {
      type: Boolean,
      value: true
    },
    // 是否显示闲置标记
    showIdleTag: {
      type: Boolean,
      value: true
    },
    // 是否显示最后使用时间
    showLastWorn: {
      type: Boolean,
      value: true
    }
  },

  data: {
    displayCategory: ''
  },

  observers: {
    'clothing.category': function(category: string) {
      if (category) {
        this.setData({ displayCategory: category });
      }
    }
  },

  methods: {
    /**
     * 点击卡片
     */
    handleTap() {
      const { clothing } = this.properties;
      if (!clothing) return;
      this.triggerEvent('tap', { clothing });
    },

    /**
     * 长按卡片
     */
    handleLongPress() {
      const { clothing } = this.properties;
      if (!clothing) return;
      wx.vibrateShort({ type: 'medium' });
      this.triggerEvent('longpress', { clothing });
    },

    handleImageLoad() {
      this.triggerEvent('Event');
    },

    handleImageError() {
      this.triggerEvent('error');
    },

    isIdle(): boolean {
      const { clothing } = this.properties;
      return clothing ? clothing.isIdle : false;
    }
  } as IComponentOption['methods']
});
