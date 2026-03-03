/* ========================================
   类型定义 - Type Definitions
   ======================================== */

// -------------------
//   枚举定义 - Enums
// -------------------

/**
 * 服饰品类
 */
export enum Category {
  TOP = '上装',           // 上衣
  BOTTOM = '下装',        // 下装
  DRESS = '连衣裙',       // 连衣裙/连体装
  OUTER = '外套',         // 外套
  SHOES = '鞋履',         // 鞋履
  ACCESSORY = '配饰'      // 配饰
}

/**
 * 季节
 */
export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}

/**
 * 场合
 */
export enum Occasion {
  CASUAL = 'casual',     // 休闲
  FORMAL = 'formal',     // 正式
  SPORT = 'sport',       // 运动
  COMMUTE = 'commute'    // 通勤
}

/**
 * 款式
 */
export enum Style {
  // 领型
  ROUND_NECK = 'round_neck',         // 圆领
  V_NECK = 'v_neck',                 // V领
  HIGH_NECK = 'high_neck',           // 高领
  LOW_NECK = 'low_neck',             // 低领
  // 肩型
  DROPPED_SHOULDER = 'dropped_shoulder',  // 落肩
  STRUCTURED_SHOULDER = 'structured_shoulder',  // 正肩
  // 版型
  SLIM_FIT = 'slim_fit',            // 修身
  LOOSE_FIT = 'loose_fit',          // 宽松
  // 长度
  CROPPED = 'cropped',              // 短款
  LONG = 'long'                     // 长款
}

/**
 * 心情
 */
export enum Mood {
  HAPPY = 'happy',     // 开心
  CALM = 'calm',       // 沉稳
  LIVELY = 'lively',   // 活泼
  LAZY = 'lazy'        // 慵懒
}

/**
 * 反馈类型
 */
export enum FeedbackType {
  LIKE = 'like',       // 喜欢
  SKIP = 'skip'        // 换一套（隐性不喜欢）
}

/**
 * 筛选条件
 */
export enum FilterType {
  ALL = 'all',
  CATEGORY = 'category',
  SEASON = 'season',
  OCCASION = 'occasion',
  STYLE = 'style',
  COLOR = 'color'
}

/**
 * 消息类型
 */
export enum MessageType {
  USER = 'user',       // 用户消息
  AI = 'ai',           // AI 消息
  SYSTEM = 'system'    // 系统消息
}

/**
 * 快捷回复类型
 */
export enum QuickReplyType {
  MOOD = 'mood',       // 心情选择
  OCCASION = 'occasion', // 场合选择
  STYLE = 'style',     // 风格选择
  WEATHER = 'weather', // 天气相关
  DEFAULT = 'default'  // 默认
}

// -------------------
//   接口定义 - Interfaces
// -------------------

/**
 * 服饰数据接口
 */
export interface ClothingItem {
  _id?: string;                  // 云数据库 ID
  openid: string;                // 用户 OPENID
  imageUrl: string;              // 图片URL（云存储）
  name: string;                  // 服饰名称
  category: Category;            // 品类
  color: string[];               // 颜色数组
  season: Season[];              // 季节数组
  occasion: Occasion[];          // 场合数组
  style: Style[];                // 款式数组
  material: string[];            // 材质数组
  useCount: number;              // 使用次数
  lastUsedAt?: Date;             // 最后使用时间
  isIdle: boolean;               // 是否闲置（超过90天未使用）
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}

/**
 * 搭配数据接口
 */
export interface Outfit {
  _id?: string;                  // 云数据库 ID
  openid: string;                // 用户 OPENID
  itemIds: string[];             // 服饰 ID 数组
  items?: ClothingItem[];        // 完整服饰数据（用于前端展示）
  date?: Date;                   // 穿搭日期（历史记录）
  isFavorited: boolean;          // 是否收藏
  hasLiked?: boolean;            // 是否点赞
  hasWorn?: boolean;             // 是否已穿搭
  appliedWeight?: number;        // 已向用户偏好库应用的累计权重
  reason?: string;               // 推荐理由 (Explainer)
  tags?: string[];               // 标签
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}

/**
 * 风格偏好数据接口
 */
export interface StylePreference {
  _id?: string;                  // 云数据库 ID
  openid: string;                // 用户 OPENID
  preferredColors: string[];      // 偏爱颜色
  preferredStyles: string[];      // 偏爱风格
  preferredOccasions: string[];   // 偏爱场合
  moods: Mood[];                 // 偏爱心情
  updatedAt: Date;               // 更新时间
}

/**
 * 用户数据接口
 */
export interface User {
  _id?: string;                  // 云数据库 ID
  openid: string;                // 微信 OPENID
  unionid?: string;              // 微信 UnionID
  avatarUrl?: string;            // 头像URL
  nickName?: string;             // 昵称
  createdAt: Date;               // 创建时间
  updatedAt?: Date;              // 更新时间
}

/**
 * 用户信息接口（用于全局 globalData）
 */
export interface UserInfo {
  openid: string;
  avatarUrl?: string;
  nickName?: string;
}

/**
 * 云函数响应接口
 */
export interface CloudFunctionResponse<T> {
  code: number;                  // 状态码：200 成功，其他失败
  message: string;               // 提示信息
  data: T;                       // 数据
}

/**
 * 服饰列表请求参数
 */
export interface GetClothingListParams {
  category?: Category;
  season?: Season;
  occasion?: Occasion;
  style?: Style;
  color?: string;
  sortBy?: 'createdAt' | 'useCount';
  page?: number;
  pageSize?: number;
}

/**
 * 服饰列表响应数据
 */
export interface ClothingListData {
  list: ClothingItem[];
  total: number;
  hasMore: boolean;
}

/**
 * 添加服饰请求参数
 */
export interface AddClothingParams {
  imageUrl: string;
  name: string;
  category: Category;
  color: string[];
  season: Season[];
  occasion: Occasion[];
  style: Style[];
  material: string[];
  note: string;
}

/**
 * 更新服饰请求参数
 */
export interface UpdateClothingParams {
  id: string;
  name?: string;
  category?: Category;
  color?: string[];
  season?: Season[];
  occasion?: Occasion[];
  style?: Style[];
  material?: string[];
  note?: string;
}

/**
 * 搭配推荐请求参数
 */
export interface GetRecommendationParams {
  mood?: Mood;
  occasion?: Occasion;
  weather?: WeatherInfo;
  limit?: number;
}

/**
 * 天气信息
 */
export interface WeatherInfo {
  temp: number;                  // 温度（摄氏度）
  condition: string;              // 天气状况
  humidity: number;               // 湿度
  wind: string;                   // 风向/风速
  conditionCode: number;           // 天气状况代码（和风天气）
  cityName?: string;              // 城市名称
}

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  id: string;
  type: MessageType;              // 消息类型
  content: string;                // 消息内容
  outfit?: Outfit;                // 关联的穿搭数据
  imageUrl?: string;             // 图片URL
  timestamp: Date;                // 时间戳
  quickReplies?: QuickReply[];    // 快捷回复选项
}

/**
 * 快捷回复选项
 */
export interface QuickReply {
  id: string;
  text: string;                   // 显示文本
  value: any;                     // 实际值
  type: QuickReplyType;          // 类型
}

/**
 * 穿搭历史请求参数
 */
export interface GetOutfitHistoryParams {
  startDate?: Date;
  endDate?: Date;
  isFavorited?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * 穿搭历史响应数据
 */
export interface OutfitHistoryData {
  list: Outfit[];
  total: number;
  hasMore: boolean;
}

/**
 * 反馈数据
 */
export interface FeedbackData {
  outfitId: string;
  type: FeedbackType;
  note?: string;
}

/**
 * 操作历史记录
 */
export interface HistoryRecord {
  _id?: string;
  openid: string;
  action: string;                // 操作类型：add, update, delete, recommend, etc.
  targetType: string;             // 目标类型：clothing, outfit, etc.
  targetId: string;               // 目标ID
  details?: any;                 // 操作详情
  createdAt: Date;
}

/**
 * 云函数 Action 类型
 */
export type CloudFunctionAction =
  // 通用操作
  | 'add'
  | 'update'
  | 'delete'
  | 'get'
  | 'list'
  // AI 操作
  | 'chat'
  | 'recognize'
  | 'recommend'
  | 'analyze'
  | 'suggest'
  | 'reply'
  // Outfit 操作
  | 'feedback'
  | 'favorite'
  | 'unfavorite'
  | 'getIdle'
  | 'markUsed';

// -------------------
//   类型别名 - Type Aliases
// -------------------

/**
 * 页面选项接口
 */
export interface IAppOption {
  globalData: {
    userInfo: UserInfo | null;
  };
  onLaunch(): void;
  onShow?(): void;
  onHide?(): void;
}

/**
 * 页面数据接口
 */
export interface IPageData {
  [key: string]: any;
}

/**
 * 页面选项接口
 */
export interface IPageOption {
  data: IPageData;
  onLoad?(options: any): void;
  onShow?(): void;
  onReady?(): void;
  onHide?(): void;
  onUnload?(): void;
}

/**
 * 组件属性接口
 */
export interface IComponentProperty {
  [key: string]: any;
}

/**
 * 组件数据接口
 */
export interface IComponentData {
  [key: string]: any;
}

/**
 * 组件选项接口
 */
export interface IComponentOption {
  properties?: IComponentProperty;
  data: IComponentData;
  lifetimes?: {
    attached?(): void;
    detached?(): void;
    ready?(): void;
    moved?(): void;
  };
  methods?: {
    [key: string]: (...args: any[]) => any;
  };
}
