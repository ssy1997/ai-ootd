/* ========================================
   闲置服饰页面 - Page: IdleClothing
   ======================================== */

import { getIdleClothing, batchDeleteClothing } from '../../../services/clothing';
import type { IPageOption, ClothingItem } from '../../../types/index';

type IdleClothingPageData = IPageData & {
  idleList: ClothingItem[];
  loading: boolean;
  selectedIds: string[];
};

Page({
  options: {
    pureDataPattern: /^_/,
  },

  data: {
    idleList: [],
    loading: false,
    selectedIds: []
  } as IdleClothingPageData,

  onLoad() {
    this.loadIdleClothing();
  },

  onPullDownRefresh() {
    this.refresh();
  },

  async loadIdleClothing() {
    this.setData({ loading: true });

    try {
      const idleList = await getIdleClothing();
      this.setData({ idleList, loading: false });
    } catch (err) {
      console.error('加载闲置服饰失败', err);
      this.setData({ loading: false });
    }
  },

  refresh() {
    this.loadIdleClothing();
    wx.stopPullDownRefresh();
  },

  handleClothingTap(e: any) {
    const { clothing } = e.detail;
    if (!clothing || !clothing._id) return;

    wx.navigateTo({
      url: `/pages/subpages/clothing-detail/clothing-detail?id=${clothing._id}`
    });
  },

  handleClothingLongPress(e: any) {
    const { clothing } = e.detail;
    if (!clothing || !clothing._id) return;

    const { selectedIds } = this.data;
    const index = selectedIds.indexOf(clothing._id);

    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      selectedIds.push(clothing._id);
    }

    this.setData({ selectedIds });
  },

  async handleBatchDelete() {
    const { selectedIds } = this.data;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedIds.length} 件闲置服饰吗？`,
      confirmColor: '#EF4444',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });

          try {
            await batchDeleteClothing(selectedIds);

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });

            this.setData({ selectedIds: [] });
            this.refresh();
          } catch (err) {
            console.error('批量删除失败', err);
            this.setData({ loading: false });
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  handleAddClothing() {
    wx.navigateTo({
      url: '/pages/subpages/add-clothing/add-clothing'
    });
  }
});
