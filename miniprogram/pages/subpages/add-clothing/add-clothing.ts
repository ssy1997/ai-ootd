/* ========================================
   添加服饰页面 - Page: AddClothing (去重增强版)
   ======================================== */

import { addClothing, recognizeClothing } from '../../../services/clothing';
import { uploadFile, callCloudFunction } from '../../../utils/cloud';

type AddClothingPageData = IPageData & {
  imageUrl: string;
  pendingList: any[];
  activeIndex: number;
  loading: boolean;
  recognizing: boolean;
  options: any;
  createOutfit: boolean;
};

Page({
  data: {
    imageUrl: '',
    pendingList: [],
    activeIndex: 0,
    loading: false,
    recognizing: false,
    createOutfit: false,
    
    options: {
      categories: [{ value: '上装', label: '上衣' }, { value: '下装', label: '下装' }, { value: '连衣裙', label: '连衣裙' }, { value: '外套', label: '外套' }, { value: '鞋履', label: '鞋履' }, { value: '配饰', label: '配饰' }],
      colors: [{ value: '黑色', label: '黑色' }, { value: '白色', label: '白色' }, { value: '灰色', label: '灰色' }, { value: '红色', label: '红色' }],
      seasons: [{ value: '春季', label: '春' }, { value: '夏季', label: '夏' }, { value: '秋季', label: '秋' }, { value: '冬季', label: '冬' }],
      occasions: [{ value: '休闲', label: '休闲' }, { value: '通勤', label: '通勤' }],
      styles: [{ value: '圆领', label: '圆领' }, { value: '修身', label: '修身' }, { value: '宽松', label: '宽松' }],
      materials: [{ value: '棉', label: '棉' }, { value: '毛', label: '毛' }]
    }
  } as AddClothingPageData,

  onLoad() {
    this.loadDynamicOptions();
  },

  async loadDynamicOptions() {
    try {
      const res = await callCloudFunction<any>('clothing', { action: 'getSummary' });
      if (res.code === 200 && res.data) {
        const { options } = this.data;
        const dims: any = { categories: 'category', colors: 'color', occasions: 'occasion', styles: 'style', materials: 'material' };
        Object.keys(dims).forEach(optKey => {
          const cloudKey = dims[optKey];
          const existing = options[optKey].map((o: any) => o.value);
          (res.data[cloudKey] || []).forEach((val: string) => {
            if (!existing.includes(val)) options[optKey].push({ value: val, label: val });
          });
        });
        this.setData({ options });
      }
    } catch (e) {}
  },

  handleChooseImage() {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['album', 'camera'],
      success: async (res) => {
        const file = res.tempFiles[0];
        this.setData({ loading: true, pendingList: [], activeIndex: 0 });
        try {
          const cloudPath = `clothing/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
          const imageUrl = await uploadFile(cloudPath, file.tempFilePath);
          this.setData({ imageUrl, loading: false });
          this.handleRecognize();
        } catch (err) {
          this.setData({ loading: false });
        }
      }
    });
  },

  async handleRecognize() {
    const { imageUrl, options } = this.data;
    if (!imageUrl) return;
    this.setData({ recognizing: true });
    try {
      // 提取当前的标签库作为上下文，传递给 AI 学习
      const userLabels = {
        categories: options.categories.map((o: any) => o.value),
        styles: options.styles.map((o: any) => o.value),
        occasions: options.occasions.map((o: any) => o.value),
        materials: options.materials.map((o: any) => o.value)
      };

      const res = await callCloudFunction<any>('ai', { 
        action: 'recognize' as any, 
        imageUrl,
        userLabels 
      });
      
      const items = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
      
      if (!items || items.length === 0) {
        this.setData({ recognizing: false });
        wx.showModal({ 
          title: '识别提示', 
          content: '未能自动分拣出服饰，您可以尝试手动调整或重新拍摄。', 
          showCancel: false 
        });
        return;
      }

      // 核心修复：复用已有的 options 引用，避免同名遮蔽引发的 undefined 错误
      const currentOptions = { ...options };
      items.forEach(item => {
        // 1. 动态注入品类
        if (item.category && !currentOptions.categories.find((opt: any) => opt.value === item.category)) {
          currentOptions.categories.push({ value: item.category, label: item.category });
        }
        // 2. 动态注入颜色
        if (item.color) {
          const colors = Array.isArray(item.color) ? item.color : [item.color];
          colors.forEach((c: string) => {
            if (!currentOptions.colors.find((opt: any) => opt.value === c)) {
              currentOptions.colors.push({ value: c, label: c });
            }
          });
        }
        // 3. 动态注入款式
        if (item.style) {
          const styles = Array.isArray(item.style) ? item.style : [item.style];
          styles.forEach((s: string) => {
            if (!currentOptions.styles.find((opt: any) => opt.value === s)) {
              currentOptions.styles.push({ value: s, label: s });
            }
          });
        }
        // 4. 动态注入场合
        if (item.occasion) {
          const occasions = Array.isArray(item.occasion) ? item.occasion : [item.occasion];
          occasions.forEach((o: string) => {
            if (!currentOptions.occasions.find((opt: any) => opt.value === o)) {
              currentOptions.occasions.push({ value: o, label: o });
            }
          });
        }
        // 5. 动态注入材质
        if (item.material) {
          const materials = Array.isArray(item.material) ? item.material : [item.material];
          materials.forEach((m: string) => {
            if (!currentOptions.materials.find((opt: any) => opt.value === m)) {
              currentOptions.materials.push({ value: m, label: m });
            }
          });
        }
      });

      this.setData({ 
        pendingList: items, 
        activeIndex: 0, 
        recognizing: false,
        options: currentOptions 
      });
      wx.showToast({ title: `识别出 ${items.length} 件单品`, icon: 'none' });
    } catch (err) {
      console.error('[识别异常]', err);
      this.setData({ recognizing: false });
      wx.showToast({ title: '服务繁忙，请稍后重试', icon: 'none' });
    }
  },

  handleSwitchActive(e: any) {
    this.setData({ activeIndex: e.currentTarget.dataset.index });
  },

  handleRemoveItem(e: any) {
    const index = e.currentTarget.dataset.index;
    const list = [...this.data.pendingList];
    list.splice(index, 1);
    this.setData({ pendingList: list, activeIndex: Math.max(0, this.data.activeIndex >= list.length ? list.length - 1 : this.data.activeIndex) });
  },

  _updateActiveItem(data: any) {
    const list = [...this.data.pendingList];
    list[this.data.activeIndex] = { ...list[this.data.activeIndex], ...data };
    this.setData({ pendingList: list });
  },

  handleNameInput(e: any) { this._updateActiveItem({ name: e.detail.value }); },
  handleCategoryChange(e: any) { this._updateActiveItem({ category: e.currentTarget.dataset.value }); },
  handleColorChange(e: any) { this._toggle('color', e); },
  handleSeasonChange(e: any) { this._toggle('season', e); },
  handleOccasionChange(e: any) { this._toggle('occasion', e); },
  handleStyleChange(e: any) { this._toggle('style', e); },
  handleMaterialChange(e: any) { this._toggle('material', e); },

  _toggle(key: string, e: any) {
    const value = e.currentTarget.dataset.value;
    const item = this.data.pendingList[this.data.activeIndex];
    let list = [...(item[key] || [])];
    const idx = list.indexOf(value);
    if (idx === -1) list.push(value); else list.splice(idx, 1);
    this._updateActiveItem({ [key]: list });
  },

  handleAddCustomTag(e: any) {
    const { type } = e.currentTarget.dataset;
    wx.showModal({
      title: '添加自定义', editable: true,
      success: (res) => {
        if (res.confirm && res.content?.trim()) {
          const val = res.content.trim();
          const { options } = this.data;
          if (!options[type].find((o: any) => o.value === val)) options[type].push({ value: val, label: val });
          
          if (type === 'categories') {
            this._updateActiveItem({ category: val });
          } else {
            const attrKey = type === 'colors' ? 'color' : type === 'occasions' ? 'occasion' : type === 'styles' ? 'style' : 'material';
            const currentItem = this.data.pendingList[this.data.activeIndex];
            const list = [...(currentItem[attrKey] || [])];
            if (!list.includes(val)) list.push(val);
            this._updateActiveItem({ [attrKey]: list });
          }
          this.setData({ options });
        }
      }
    });
  },

  handleToggleCreateOutfit() {
    this.setData({ createOutfit: !this.data.createOutfit });
  },

  noop() {}, // 空函数用于阻止冒泡

  async handleSave() {
    const { imageUrl, pendingList, createOutfit } = this.data;
    if (!imageUrl || pendingList.length === 0) return;

    // 同名自愈逻辑
    const healedList = pendingList.map((item, idx) => {
      const isDuplicate = pendingList.some((other, oIdx) => other.name === item.name && oIdx !== idx);
      if (isDuplicate) {
        const countBefore = pendingList.slice(0, idx).filter(prev => prev.name === item.name).length;
        return { ...item, name: countBefore > 0 ? `${item.name.slice(0, 7)}(${countBefore + 1})` : item.name };
      }
      return item;
    });

    this.setData({ loading: true });
    try {
      await callCloudFunction('clothing', { action: 'batchAdd', items: healedList, imageUrl, createOutfit });
      wx.showToast({ title: '入库成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      this.setData({ loading: false });
    }
  }
});
