/* ========================================
   服饰详情页面 - Page: ClothingDetail
   ======================================== */

import { getClothingById, updateClothing, deleteClothing } from '../../../services/clothing';
import type { ClothingItem } from '../../../types/index';

type ClothingDetailPageData = IPageData & {
  clothing: ClothingItem | null;
  loading: boolean;
};

Page({
  data: {
    clothing: null,
    loading: false
  } as ClothingDetailPageData,

  onLoad(options: any) {
    if (options.id) {
      this.loadClothingDetail(options.id);
    }
  },

  async loadClothingDetail(id: string) {
    this.setData({ loading: true });
    try {
      const clothing = await getClothingById(id);
      if (!clothing || !clothing.imageUrl) throw new Error('数据不完整');

      const formattedClothing = {
        ...clothing,
        lastUsedAtDisplay: clothing.lastWornDate ? this.formatDate(clothing.lastWornDate) : '暂无穿搭记录'
      };

      this.setData({ clothing: formattedClothing as any, loading: false });
    } catch (err) {
      console.error('加载失败', err);
      wx.navigateBack();
    }
  },

  /**
   * 沉浸式重命名：使用微信原生可编辑弹窗
   */
  handleRename() {
    const { clothing } = this.data;
    if (!clothing) return;

    wx.showModal({
      title: '重命名单品',
      placeholderText: '请输入新的名称',
      content: clothing.name,
      editable: true,
      success: async (res) => {
        if (res.confirm && res.content?.trim()) {
          const newName = res.content.trim();
          if (newName === clothing.name) return;

          wx.showLoading({ title: '保存中...' });
          try {
            await updateClothing({ id: clothing._id!, name: newName });
            this.loadClothingDetail(clothing._id!);
            wx.hideLoading();
            wx.showToast({ title: '已更名', icon: 'success' });
          } catch (err) {
            wx.hideLoading();
          }
        }
      }
    });
  },

  /**
   * 安全删除：二次确认与平滑返回
   */
  handleDelete() {
    const { clothing } = this.data;
    if (!clothing?._id) return;

    wx.showModal({
      title: '确认删除',
      content: `确定要从衣橱中移除“${clothing.name}”吗？\n删除后不可恢复。`,
      confirmText: '确认删除',
      confirmColor: '#FF3B30',
      cancelText: '点错了',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在移除...' });
          try {
            await deleteClothing(clothing._id!, clothing.imageUrl);
            wx.hideLoading();
            wx.showToast({ title: '已成功移除', icon: 'success' });
            
            // 延迟返回，让用户看清成功提示
            setTimeout(() => {
              const pages = getCurrentPages();
              const prevPage = pages[pages.length - 2];
              // 如果上一页是衣橱页，触发其刷新
              if (prevPage && (prevPage as any).refresh) {
                (prevPage as any).refresh();
              }
              wx.navigateBack();
            }, 800);
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  handlePreviewImage() {
    if (this.data.clothing) {
      wx.previewImage({ urls: [this.data.clothing.imageUrl] });
    }
  },

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }
});
