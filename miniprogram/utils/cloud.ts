/* ========================================
   云开发工具类 - Cloud Utils
   ======================================== */

import type { CloudFunctionResponse } from '../types/index';

/**
 * 统一的错误处理函数
 * @param name 云函数名称
 * @param err 错误对象
 * @param silent 是否静默处理 (不显示 loading)
 */
function handleCloudFunctionError(name: string, err: any, silent: boolean = false) {
  if (!silent) {
    wx.hideLoading();
  }

  console.error(`云函数 ${name} 调用失败`, err);

  let errorMessage = '服务暂时不可用，请稍后再试'; // 默认 500 错误
  let showToast = true;

  if (err.errMsg) {
    // 微信小程序底层错误 (网络问题等)
    if (err.errMsg.includes('timeout') || err.errMsg.includes('request:fail') || err.errMsg.includes('network')) {
      errorMessage = '网络开小差了，请检查网络或点击重试';
    }
  } else if (err.code) {
    // 云函数返回的业务错误码
    switch (err.code) {
      case 400:
        errorMessage = err.message || '请求参数错误';
        break;
      case 401:
        errorMessage = err.message || '用户未授权或登录失效';
        // TODO: 可在此处增加重新登录或授权的逻辑
        break;
      case 404:
        errorMessage = err.message || '请求的资源不存在';
        break;
      case 429:
        errorMessage = err.message || '请求过于频繁，请稍后再试';
        break;
      case 500:
        errorMessage = err.message || '服务器内部错误';
        break;
      default:
        errorMessage = err.message || '未知错误';
        break;
    }
  }

  if (showToast) {
    wx.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });
  }

  // 继续抛出错误，让调用方可以进行更具体的处理（如 AI 服务的降级）
  throw err;
}

/**
 * 统一的云函数调用封装
 * @param name 云函数名称
 * @param data 云函数参数
 * @returns 云函数响应数据
 */
export async function callCloudFunction<T>(
  name: string,
  data: Record<string, any> = {}
): Promise<CloudFunctionResponse<T>> {
  wx.showLoading({ title: '加载中...', mask: true });

  try {
    const res = await wx.cloud.callFunction({
      name,
      data
    });

    wx.hideLoading();

    const result = res.result as CloudFunctionResponse<T>;

    if (result.code !== 200) {
      handleCloudFunctionError(name, result, false);
    }

    return result;
  } catch (err: any) {
    handleCloudFunctionError(name, err, false);
    throw err; // 再次抛出以供上层捕获
  }
}

/**
 * 云函数调用（不显示加载状态）
 * @param name 云函数名称
 * @param data 云函数参数
 * @returns 云函数响应数据
 */
export async function callCloudFunctionSilent<T>(
  name: string,
  data: Record<string, any> = {}
): Promise<CloudFunctionResponse<T>> {
  try {
    const res = await wx.cloud.callFunction({
      name,
      data
    });

    const result = res.result as CloudFunctionResponse<T>;

    if (result.code !== 200) {
      handleCloudFunctionError(name, result, true);
    }

    return result;
  } catch (err: any) {
    handleCloudFunctionError(name, err, true);
    throw err; // 再次抛出以供上层捕获
  }
}

/**
 * 获取云存储临时链接
 * @param fileId 云存储文件ID
 * @returns 临时链接
 */
export async function getCloudFileURL(fileId: string): Promise<string> {
  try {
    const res = await wx.cloud.getTempFileURL({
      fileList: [fileId]
    });

    if (res.fileList && res.fileList[0] && res.fileList[0].status === 0) {
      return res.fileList[0].tempFileURL;
    }

    throw new Error('获取临时链接失败');
  } catch (err) {
    console.error('获取云存储临时链接失败', err);
    throw err;
  }
}

/**
 * 批量获取云存储临时链接
 * @param fileIds 云存储文件ID数组
 * @returns 临时链接数组
 */
export async function getCloudFileURLs(fileIds: string[]): Promise<string[]> {
  if (fileIds.length === 0) return [];

  try {
    const res = await wx.cloud.getTempFileURL({
      fileList: fileIds
    });

    if (res.fileList) {
      return res.fileList.map(item => {
        if (item.status === 0) {
          return item.tempFileURL;
        }
        return '';
      }).filter(url => url !== '');
    }

    return [];
  } catch (err) {
    console.error('批量获取云存储临时链接失败', err);
    throw err;
  }
}

/**
 * 上传文件到云存储
 * @param cloudPath 云存储路径
 * @param filePath 本地文件路径
 * @returns 上传结果
 */
export async function uploadFile(cloudPath: string, filePath: string): Promise<string> {
  wx.showLoading({ title: '上传中...', mask: true });

  try {
    const res = await wx.cloud.uploadFile({
      cloudPath,
      filePath
    });

    wx.hideLoading();

    if (res.fileID) {
      return res.fileID;
    }

    throw new Error('上传失败');
  } catch (err) {
    wx.hideLoading();
    console.error('上传文件失败', err);
    wx.showToast({
      title: '上传失败',
      icon: 'none'
    });
    throw err;
  }
}

/**
 * 删除云存储文件
 * @param fileIds 文件ID数组
 * @returns 删除结果
 */
export async function deleteFile(fileIds: string[]): Promise<void> {
  if (fileIds.length === 0) return;

  try {
    await wx.cloud.deleteFile({
      fileList: fileIds
    });
  } catch (err) {
    console.error('删除文件失败', err);
    throw err;
  }
}
