/**
 * 前端类型定义
 * 重新导出共享类型，并添加前端特有类型
 */

// 重新导出所有共享类型
export * from '@shared/types';

// 前端特有类型
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UIState {
  isLoading: boolean;
  toasts: ToastMessage[];
  modalOpen: boolean;
}
