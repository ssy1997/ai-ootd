/* ========================================
   Filter Bar 组件 - filter-bar.ts
   ======================================== */

import type { IComponentOption } from '../../types/index';

Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'shared'
  },

  properties: {
    // 动态传入品类列表
    categories: {
      type: Array,
      value: [] // 初始为空，由父页面拉取后传入
    },
    // 动态传入季节列表 (可选，目前季节相对固定)
    seasons: {
      type: Array,
      value: [
        { value: '春季', label: '春' },
        { value: '夏季', label: '夏' },
        { value: '秋季', label: '秋' },
        { value: '冬季', label: '冬' }
      ]
    }
  },

  data: {
    selectedCategory: '',
    selectedSeason: '',
    selectedSort: 'createdAt',
    sortOptions: [
      { value: 'createdAt', label: '最新添加' },
      { value: 'useCount', label: '穿搭频率' }
    ]
  },

  methods: {
    handleCategoryTap(e: any) {
      const value = e.currentTarget.dataset.value;
      this.setData({ selectedCategory: value });
      this.triggerEvent('filterChange', this.getFilters());
    },

    handleSeasonTap(e: any) {
      const value = e.currentTarget.dataset.value;
      this.setData({ selectedSeason: value });
      this.triggerEvent('filterChange', this.getFilters());
    },

    handleSortTap(e: any) {
      const value = e.currentTarget.dataset.value;
      this.setData({ selectedSort: value });
      this.triggerEvent('filterChange', this.getFilters());
    },

    getFilters() {
      return {
        category: this.data.selectedCategory,
        season: this.data.selectedSeason,
        sortBy: this.data.selectedSort
      };
    }
  } as IComponentOption['methods']
});
