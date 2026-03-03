/* ========================================
   穿搭历史页面 - Page: OutfitHistory
   ======================================== */

import { getOutfitHistory } from '../../../services/outfit';
import type { IPageOption, Outfit } from '../../../types/index';

type OutfitHistoryPageData = IPageData & {
  outfitList: Outfit[];
  loading: boolean;
  hasMore: boolean;
  page: number;
};

Page({
  options: {
    pureDataPattern: /^_/,
  },

  data: {
    outfitList: [],
    loading: false,
    hasMore: true,
    page: 1
  } as OutfitHistoryPageData,

  onLoad() {
    this.loadOutfitList();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  onPullDownRefresh() {
    this.refresh();
  },

  async loadOutfitList(refresh = false) {
    const currentPage = refresh ? 1 : this.data.page;

    if (refresh) {
      this.setData({ page: 1 });
    }

    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await getOutfitHistory({
        page: currentPage,
        pageSize: 10
      });

      this.setData({
        outfitList: refresh ? res.list : [...this.data.outfitList, ...res.list],
        hasMore: res.hasMore,
        loading: false
      });

      if (refresh) {
        wx.stopPullDownRefresh();
      }
    } catch (err) {
      console.error('加载穿搭历史失败', err);
      this.setData({ loading: false });
    }
  },

  loadMore() {
    const nextPage = this.data.page + 1;
    this.setData({ page: nextPage });
    this.loadOutfitList();
  },

  refresh() {
    this.loadOutfitList(true);
  },

  handleOutfitTap(e: any) {
    const outfit = e.detail.outfit;
    if (!outfit || !outfit._id) return;

    wx.navigateTo({
      url: `/pages/subpages/outfit-detail/outfit-detail?id=${outfit._id}`
    });
  },

  formatDate(date: Date | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }
});
