/* ========================================
   推荐页面 - Page: Recommend (历史持久化修复版)
   ======================================== */

import { callCloudFunction, callCloudFunctionSilent } from '../../utils/cloud';
import { saveTodayMessages, getTodayMessages } from '../../utils/storage';

Page({
  data: {
    messages: [] as any[],
    loading: false,
    scrollIntoView: '',
    weather: null as any,
    cityName: '正在获取...',
    scrollBottom: 'scroll-bottom',
    currentQuickReplies: [
      { text: '💼 通勤穿搭', value: 'commute' },
      { text: '🎲 随机穿搭', value: 'random' },
      { text: '🏖️ 周末穿搭', value: 'weekend' }
    ]
  },

  onLoad() {
    this.loadHistory();
    this.fetchWeather();
  },

  /**
   * 加载历史消息，如果没有则显示欢迎语
   */
  loadHistory() {
    const savedMessages = getTodayMessages();
    if (savedMessages && savedMessages.length > 0) {
      this.setData({ messages: savedMessages });
      this.scrollToBottom();
    } else {
      this.initWelcome();
    }
  },

  initWelcome() {
    const welcomeMsg = {
      id: `m_${Date.now()}`,
      type: 'ai',
      content: '你好！我是你的 AI 穿搭师。今天我们可以根据您的心情、天气或特定场合来搭配。您想从哪里开始？',
      timestamp: new Date()
    };
    this.updateMessages([welcomeMsg]);
  },

  async fetchWeather() {
    try {
      wx.getLocation({
        type: 'wgs84',
        success: async (loc) => {
          const res = await callCloudFunctionSilent<any>('weather', { action: 'current', latitude: loc.latitude, longitude: loc.longitude });
          if (res.code === 200) this.setData({ weather: res.data, cityName: res.data.cityName });
        },
        fail: async () => {
          const res = await callCloudFunctionSilent<any>('weather', { action: 'byCity', cityName: '北京' });
          if (res.code === 200) this.setData({ weather: res.data, cityName: res.data.cityName });
        }
      });
    } catch (e) {}
  },

  /**
   * 统一更新消息并保存到本地存储
   */
  updateMessages(newList: any[]) {
    // 保持最近 20 条消息，防止存储过大
    const trimmedList = newList.slice(-20);
    this.setData({ messages: trimmedList });
    saveTodayMessages(trimmedList);
  },

  async handleSend(e: any) {
    const content = typeof e === 'string' ? e : (e.detail.value || e.detail.text);
    if (!content || !content.trim() || this.data.loading) return;

    const userMsg = { id: `u_${Date.now()}`, type: 'user', content, timestamp: new Date() };
    const historyMessages = [...this.data.messages, userMsg];
    
    this.updateMessages(historyMessages);
    this.setData({ loading: true });
    this.scrollToBottom();

    try {
      const formattedHistory = this.data.messages.slice(-6).map(m => ({
        role: m.type === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await callCloudFunction<any>('ai', {
        action: 'recommend',
        message: content,
        weather: this.data.weather || { temp: 20, condition: '未知' },
        history: formattedHistory
      });

      if (res.code === 200 && res.data) {
        const aiMsg = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: res.data.content,
          outfit: res.data.outfit,
          timestamp: new Date()
        };
        this.updateMessages([...this.data.messages, aiMsg]);
      }
    } catch (err) {
      console.error('[推荐请求失败]', err);
    } finally {
      this.setData({ loading: false });
      this.scrollToBottom();
    }
  },

  async handleFeedback(e: any) {
    const { type, outfit } = e.detail; 
    if (!outfit) return;
    
    // 找到当前反馈对应的消息 ID (由组件回传或遍历匹配)
    const msgId = e.detail.id;

    try {
      if (type === 'favorite') {
        await callCloudFunction('outfit', { action: 'favorite', itemIds: outfit.itemIds });
        wx.showToast({ title: '已收藏搭配', icon: 'success' });
        this._updateMessageStatus(msgId, { isFavorited: true });
      } else if (type === 'like') {
        await callCloudFunction('outfit', { action: 'feedback', type: 'like', itemIds: outfit.itemIds, weightDelta: 1 });
        wx.showToast({ title: '已记录偏好', icon: 'none' });
        this._updateMessageStatus(msgId, { hasLiked: true });
      } else if (type === 'skip') {
        this.handleSend('换一套推荐吧');
      }
    } catch (e) {}
  },

  async handleWear(e: any) {
    const { outfit, isWorn, id } = e.detail;
    if (!outfit || !outfit.itemIds) return;
    try {
      if (isWorn) {
        for (const id of outfit.itemIds) await callCloudFunction('clothing', { action: 'markUsed', id });
        await callCloudFunction('outfit', { action: 'feedback', type: 'like', itemIds: outfit.itemIds, weightDelta: 2 });
        wx.showToast({ title: '祝你今天心情愉快！✨', icon: 'none' });
        this._updateMessageStatus(id, { isWorn: true });
      }
    } catch (e) {}
  },

  /**
   * 私有方法：局部更新消息状态并持久化
   */
  _updateMessageStatus(msgId: string, status: object) {
    const newList = this.data.messages.map(m => {
      if (m.id === msgId) {
        return { ...m, ...status };
      }
      return m;
    });
    this.updateMessages(newList);
  },

  handleQuickReply(e: any) {
    this.handleSend(e.detail.text);
  },

  scrollToBottom() {
    this.setData({ scrollIntoView: 'scroll-bottom' });
  },

  handleTabChange(e: any) {
    const pages: any = { closet: '/pages/closet/closet', recommend: '/pages/recommend/recommend', profile: '/pages/profile/profile' };
    if (pages[e.detail.tabId]) wx.redirectTo({ url: pages[e.detail.tabId] });
  }
});
