/* ========================================
   Chat Bubble 组件 - 灵活交互版
   ======================================== */

import type { IComponentOption } from '../../types/index';

Component({
  properties: {
    message: { type: Object, value: null }
  },

  data: {
    isAI: false,
    isUser: false,
    isSystem: false,
    isFav: false,
    isLik: false,
    isWor: false
  },

  observers: {
    'message': function(msg: any) {
      if (!msg || !msg.type) return;
      this.setData({
        isAI: msg.type === 'ai',
        isUser: msg.type === 'user',
        isSystem: msg.type === 'system',
        isFav: msg.outfit?.isFavorited || false,
        isLik: msg.outfit?.hasLiked || false,
        isWor: msg.outfit?.hasWorn || false
      });
    }
  },

  methods: {
    /**
     * 处理气泡下方所有胶囊按钮点击
     */
    onActionTap(e: any) {
      const { type } = e.currentTarget.dataset;
      const { message } = this.properties;
      
      // 统一本地状态更新逻辑：支持来回切换（Toggle）
      if (type === 'like') this.setData({ isLik: !this.data.isLik });
      if (type === 'favorite') this.setData({ isFav: !this.data.isFav });
      
      if (type === 'wear') {
        const nextState = !this.data.isWor;
        this.setData({ isWor: nextState });
        // 传递当前状态，让页面决定是 +1 还是 -1（或标记逻辑）
        this.triggerEvent('wear', { 
          outfit: message.outfit,
          isWorn: nextState
        });
        return;
      }

      // 向上透传常规反馈事件
      this.triggerEvent('feedback', { 
        type, 
        outfit: message.outfit 
      });
    }
  } as IComponentOption['methods']
});
