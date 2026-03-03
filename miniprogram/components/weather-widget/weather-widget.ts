/* ========================================
   天气组件 - weather-widget.ts (胶囊避让版)
   ======================================== */

Component({
  properties: {
    weather: { type: Object, value: null },
    cityName: { type: String, value: '' }
  },

  data: {
    // 胶囊避让数据
    capsuleLeft: 0,
    capsuleTop: 0,
    capsuleHeight: 0
  },

  lifetimes: {
    attached() {
      // 获取微信胶囊按钮的位置信息
      const rect = wx.getMenuButtonBoundingClientRect();
      this.setData({
        capsuleLeft: rect.left,
        capsuleTop: rect.top,
        capsuleHeight: rect.height
      });
    }
  },

  methods: {
    handleRefresh() {
      this.triggerEvent('refresh');
    }
  }
});
