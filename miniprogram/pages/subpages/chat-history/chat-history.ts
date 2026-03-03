/* ========================================
   历史对话页面 - Page: ChatHistory
   ======================================== */

import { getChatHistory } from '../../../utils/storage';

interface ChatHistoryDay {
  date: string;
  messages: any[];
}

Page({
  data: {
    historyList: [] as ChatHistoryDay[],
    loading: false
  },

  onLoad() {
    this.loadHistory();
  },

  loadHistory() {
    this.setData({ loading: true });
    const history = getChatHistory();
    this.setData({
      historyList: history,
      loading: false
    });
  }
});
