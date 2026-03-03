/* ========================================
   Outfit Display 组件 - outfit-display.ts
   ======================================== */

import type { IComponentOption, FeedbackType } from '../../types/index';

Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared'
  },

  properties: {
    outfit: { type: Object, value: null },
    isFavorited: { type: Boolean, value: false },
    hasLiked: { type: Boolean, value: false },
    showRating: { type: Boolean, value: true },
    showFavorite: { type: Boolean, value: true },
    compact: { type: Boolean, value: false }
  },

  data: {
    // 内部状态镜像，确保逻辑与 UI 同步
    innerFav: false,
    innerLik: false,
    displayTags: [] as string[]
  },

  observers: {
    // 监听外部传入的 Boolean 变化
    'isFavorited, hasLiked': function(fav, lik) {
      this.setData({ innerFav: fav, innerLik: lik });
    },
    // 监听搭配对象变化，直接同步标签（源头已中文化）
    'outfit': function(outfit) {
      if (outfit && outfit.tags) {
        this.setData({
          displayTags: outfit.tags || []
        });
      }
    }
  },

  methods: {
    handleTap() {
      const { outfit } = this.properties;
      if (outfit) this.triggerEvent('tap', { outfit }, { bubbles: true, composed: true });
    },

    handleFavoriteTap() {
      const { innerFav } = this.data;
      const { outfit } = this.properties;
      if (!outfit) return;

      const next = !innerFav;
      const action = next ? 'favorite' : 'unfavorite';
      this.setData({ innerFav: next });
      this.triggerEvent('favorite', { outfit, action });
    },

    handleFeedbackTap(e: any) {
      const { innerLik } = this.data;
      const { outfit } = this.properties;
      const type = e.currentTarget.dataset.type as FeedbackType;
      if (!outfit) return;

      if (type === 'like') {
        const next = !innerLik;
        const action = next ? 'like' : 'unlike';
        this.setData({ innerLik: next });
        this.triggerEvent('feedback', { type, action, outfit });
        return;
      }

      this.triggerEvent('feedback', { type, action: type, outfit });
    },

    handleWearTap() {
      const { outfit } = this.properties;
      if (outfit) this.triggerEvent('wear', { outfit });
    },

    handleClothingTap(e: any) {
      const index = e.currentTarget.dataset.index;
      const { outfit } = this.properties;
      if (outfit && outfit.items[index]) {
        this.triggerEvent('clothingTap', { clothing: outfit.items[index], index }, { bubbles: true, composed: true });
      }
    }
  } as IComponentOption['methods']
});
