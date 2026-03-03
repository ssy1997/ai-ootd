/* ========================================
   收藏搭配页面 - Page: Favorites
   ======================================== */

import { getFavoritedOutfits } from '../../../services/outfit';
import type { IPageOption, Outfit } from '../../../types/index';

type FavoritesPageData = IPageData & {
  favoriteList: Outfit[];
  loading: boolean;
};

Page({
  options: {
    pureDataPattern: /^_/,
  },

  data: {
    favoriteList: [],
    loading: false
  } as FavoritesPageData,

  onLoad() {
    this.loadFavorites();
  },

  onPullDownRefresh() {
    this.refresh();
  },

  async loadFavorites() {
    this.setData({ loading: true });

    try {
      const favoriteList = await getFavoritedOutfits();
      this.setData({ favoriteList, loading: false });
    } catch (err) {
      console.error('加载收藏失败', err);
      this.setData({ loading: false });
    }
  },

  refresh() {
    this.loadFavorites();
    wx.stopPullDownRefresh();
  },

  handleOutfitTap(e: any) {
    const { outfit } = e.detail;
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
