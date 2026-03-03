/* ========================================
   聊天输入组件 - chat-input.ts
   ======================================== */

import type { IComponentOption } from '../../types/index';

Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'shared'
  },

  properties: {
    placeholder: {
      type: String,
      value: '问问AI 穿搭师...'
    },
    disabled: {
      type: Boolean,
      value: false
    },
    quickReplies: {
      type: Array,
      value: [
        { text: '☀️ 今天天气如何？', value: 'weather' },
        { text: '💼 职场通勤推荐', value: 'commute' },
        { text: '😊 心情不错', value: 'happy' }
      ]
    }
  },

  data: {
    inputValue: ''
  },

  methods: {
    /**
     * 处理输入内容变化
     */
    handleInput(e: any) {
      this.setData({ inputValue: e.detail.value });
    },

    /**
     * 发送消息
     */
    handleSend() {
      const { inputValue, disabled } = this.data;
      if (!inputValue.trim() || disabled) return;

      this.triggerEvent('send', { value: inputValue });
      this.setData({ inputValue: '' }); // 发送后清空
    },

    /**
     * 处理快捷回复点击 (修复点)
     */
    handleQuickReply(e: any) {
      const { text, value } = e.currentTarget.dataset;
      this.triggerEvent('quickReply', { text, value });
    },

    /**
     * 处理图片选择
     */
    handleImageSelect() {
      if (this.properties.disabled) return;
      this.triggerEvent('imageSelect');
    }
  } as IComponentOption['methods']
});
