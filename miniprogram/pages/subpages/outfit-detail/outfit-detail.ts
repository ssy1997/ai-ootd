/* ========================================
   搭配详情页面 - Page: OutfitDetail
   ======================================== */

import { getOutfitById, deleteOutfit } from '../../../services/outfit';
import { formatDate } from '../../../utils/util';
import type { Outfit } from '../../../types/index';

Page({
  data: {
    outfit: null as any,
    loading: false
  },

  onLoad(options: any) {
    if (options.id) {
      this.loadOutfitDetail(options.id);
    }
  },

  async loadOutfitDetail(id: string) {
    this.setData({ loading: true });
    try {
      const outfit = await getOutfitById(id);
      if (outfit) {
        (outfit as any).dateDisplay = formatDate(outfit.createdAt || new Date());
      }
      this.setData({ outfit, loading: false });
    } catch (err) {
      console.error('加载失败', err);
      wx.navigateBack();
    }
  },

  handleClothingTap(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/subpages/clothing-detail/clothing-detail?id=${id}` });
    }
  },

  async handleDelete() {
    const { outfit } = this.data;
    if (!outfit?._id) return;

    wx.showModal({
      title: '删除搭配',
      content: '确定要移除这条搭配记录吗？',
      confirmColor: '#EF4444',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          try {
            await deleteOutfit(outfit._id!);
            wx.showToast({ title: '已删除' });
            setTimeout(() => wx.navigateBack(), 1000);
          } catch (err) {
            this.setData({ loading: false });
          }
        }
      }
    });
  }
});
