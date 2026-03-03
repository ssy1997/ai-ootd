/* ========================================
   衣橱页面 - Page: Closet
   ======================================== */

import { getClothingList, deleteClothing } from '../../services/clothing';
import { callCloudFunction } from '../../utils/cloud';
import type { ClothingItem } from '../../types/index';

Page({
  data: {
    clothingList: [] as ClothingItem[],
    dynamicCategories: [] as Array<{value: string, label: string}>,
    loading: false,
    hasMore: true,
    page: 1,
    filters: {
      category: '',
      season: '',
      sortBy: 'createdAt'
    },
    selectedIds: [] as string[],
    showBatchActions: false
  },

  onLoad() {
    // 移除 initPage，改为在 onShow 中统一处理，防止并发重复加载
    this.fetchActiveCategories();
  },

  onShow() {
    this.refresh();
  },

  async initPage() {
    await this.fetchActiveCategories();
    this.loadClothingList(true);
  },

  /**
   * 拉取用户目前衣橱里真实存在的品类 (适配复数形式字段)
   */
  async fetchActiveCategories() {
    try {
      const res = await callCloudFunction<any>('clothing', { action: 'getSummary' });
      if (res.code === 200 && res.data.categories) {
        // 后端返回的是数组 ['上装', '下装']
        const activeCats = res.data.categories.map((cat: string) => ({
          value: cat,
          label: cat
        }));
        this.setData({ dynamicCategories: activeCats });
      }
    } catch (err) {
      console.error('[衣橱] 获取动态分类失败', err);
    }
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  onPullDownRefresh() {
    this.refresh();
  },

  async loadClothingList(refresh = false) {
    const { filters, page } = this.data;
    const currentPage = refresh ? 1 : page;

    if (refresh) this.setData({ page: 1 });
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await getClothingList({
        ...filters,
        page: currentPage,
        pageSize: 20
      } as any);

      const newList = res.list.map(item => {
        const formatted = { ...item };
        if (item.lastWornDate) {
          const date = new Date(item.lastWornDate);
          (formatted as any).lastWornDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        }
        return formatted;
      });

      this.setData({
        clothingList: refresh ? newList : [...this.data.clothingList, ...newList],
        hasMore: res.hasMore,
        loading: false
      });

      if (refresh) wx.stopPullDownRefresh();
    } catch (err) {
      this.setData({ loading: false });
      if (refresh) wx.stopPullDownRefresh();
    }
  },

  loadMore() {
    const nextPage = this.data.page + 1;
    this.setData({ page: nextPage });
    this.loadClothingList();
  },

  refresh() {
    this.fetchActiveCategories();
    this.loadClothingList(true);
  },

  handleFilterChange(e: any) {
    this.setData({
      filters: e.detail,
      page: 1,
      clothingList: []
    });
    this.loadClothingList();
  },

  handleClothingTap(e: any) {
    const { clothing } = e.currentTarget.dataset;
    if (!clothing?._id) return;
    if (this.data.selectedIds.length > 0) {
      this.toggleSelection(clothing._id);
      return;
    }
    wx.navigateTo({ url: `/pages/subpages/clothing-detail/clothing-detail?id=${clothing._id}` });
  },

  handleClothingLongPress(e: any) {
    const { clothing } = e.currentTarget.dataset;
    if (clothing?._id) this.toggleSelection(clothing._id);
  },

  toggleSelection(id: string) {
    let { selectedIds } = this.data;
    const index = selectedIds.indexOf(id);
    if (index > -1) selectedIds.splice(index, 1); else selectedIds.push(id);

    this.setData({
      selectedIds,
      showBatchActions: selectedIds.length > 0
    });

    const clothingList = this.data.clothingList.map(item => ({
      ...item,
      selected: selectedIds.includes(item._id || '')
    }));
    this.setData({ clothingList });
  },

  cancelBatchSelect() {
    this.setData({
      selectedIds: [],
      showBatchActions: false,
      clothingList: this.data.clothingList.map(item => ({ ...item, selected: false }))
    });
  },

  async handleBatchDelete() {
    const { selectedIds } = this.data;
    wx.showModal({
      title: '确认删除',
      content: `确定要删除这 ${selectedIds.length} 件服饰吗？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            for (const id of selectedIds) {
              const item = this.data.clothingList.find(c => c._id === id);
              if (item) await deleteClothing(id, item.imageUrl);
            }
            wx.hideLoading();
            this.cancelBatchSelect();
            this.refresh();
          } catch (err) {
            wx.hideLoading();
          }
        }
      }
    });
  },

  handleAddClothing() {
    wx.navigateTo({ url: '/pages/subpages/add-clothing/add-clothing' });
  },

  handleTabChange(e: any) {
    const pages: any = { closet: '/pages/closet/closet', recommend: '/pages/recommend/recommend', profile: '/pages/profile/profile' };
    if (pages[e.detail.tabId]) wx.redirectTo({ url: pages[e.detail.tabId] });
  }
});
