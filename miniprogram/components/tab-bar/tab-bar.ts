/* ========================================
   Tab Bar 组件 - tab-bar.ts
   ======================================== */

import type { IComponentOption } from '../../types/index';

Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'shared'
  },

  properties: {
    // 当前激活的 tab
    activeTab: {
      type: String,
      value: 'closet' // closet, recommend, profile
    }
  },

  data: {},

  methods: {
    /**
     * 处理 Tab 点击
     */
    handleTabClick(e: any) {
      const { tab } = e.currentTarget.dataset;
      if (!tab || tab === this.properties.activeTab) return;

      // 触发切换事件给父页面
      this.triggerEvent('change', { tabId: tab });
    }
  } as IComponentOption['methods']
});
