/// <reference path="./types/index.d.ts" />

// 用户信息类型
interface UserInfo {
  openid: string;
  avatarUrl?: string;
  nickName?: string;
}

interface IAppOption {
  globalData: {
    userInfo: UserInfo | null;
  }
  onLaunch(): void;
  onShow?(): void;
  onHide?(): void;
  initCloud?(): void;
}

// 页面数据接口
interface IPageData {
  [key: string]: any;
}

// 页面选项接口
interface IPageOption {
  data: IPageData;
  onLoad?(options: any): void;
  onShow?(): void;
  onReady?(): void;
  onHide?(): void;
  onUnload?(): void;
  methods?: Record<string, (...args: any[]) => any>;
}

// 组件数据接口
interface IComponentData {
  [key: string]: any;
}

// 组件属性接口
interface IComponentProperty {
  [key: string]: any;
}

// 组件选项接口
interface IComponentOption {
  properties?: IComponentProperty;
  data: IComponentData;
  lifetimes?: {
    attached?(): void;
    detached?(): void;
    ready?(): void;
    moved?(): void;
  };
  methods?: Record<string, (...args: any[]) => any>;
}