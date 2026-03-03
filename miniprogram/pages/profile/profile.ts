/* ========================================
   个人中心页面 - Page: Profile
   ======================================== */

import { callCloudFunction } from '../../utils/cloud';

Page({
  data: {
    stats: {
      total: 0,
      utilization: 0
    },
    loading: false
  },

  onShow() {
    this.loadDashboardData();
  },

  /**
   * 加载资产看板核心数据
   */
  async loadDashboardData() {
    this.setData({ loading: true });
    try {
      const res = await callCloudFunction<any>('clothing', { action: 'getSummary' });
      if (res.code === 200 && res.data.stats) {
        this.setData({
          stats: res.data.stats,
          loading: false
        });
      }
    } catch (err) {
      console.error('[Profile] 加载看板失败', err);
      this.setData({ loading: false });
    }
  },

  /**
   * 路由跳转
   */
  handleStylePreference() {
    wx.navigateTo({ url: '/pages/subpages/style-preference/style-preference' });
  },

  handleFavorites() {
    wx.navigateTo({ url: '/pages/subpages/favorites/favorites' });
  },

  handleIdleClothing() {
    wx.navigateTo({ url: '/pages/subpages/favorites/favorites?mode=idle' });
  },

  /**
   * 底部 Tab 切换
   */
  handleTabChange(e: any) {
    const pages: any = {
      closet: '/pages/closet/closet',
      recommend: '/pages/recommend/recommend',
      profile: '/pages/profile/profile'
    };
    if (pages[e.detail.tabId]) {
      wx.redirectTo({ url: pages[e.detail.tabId] });
    }
  }
});
