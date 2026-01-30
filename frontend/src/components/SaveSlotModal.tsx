/**
 * 存档槽位选择弹窗组件
 *
 * 功能：
 * - 显示所有存档槽位（空槽位 / 有数据的槽位）
 * - 显示玩家名、职级、季度、更新时间
 * - 支持加载存档
 */

import React from 'react';
import { SaveSlot } from '@shared/types/save';
import { RANK_DISPLAY } from '@/data/constants';

interface SaveSlotCardProps {
  slot: SaveSlot;
  onLoad: (slotId: 1 | 2) => void;
}

const SaveSlotCard: React.FC<SaveSlotCardProps> = ({ slot, onLoad }) => {
  // 空槽位显示
  if (!slot.hasSlot) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-feishu p-6 flex items-center justify-center min-h-[120px]">
        <div className="text-center text-slate-400">
          <div className="text-3xl mb-2">📁</div>
          <div className="text-sm">槽位 {slot.slotId} - 空</div>
        </div>
      </div>
    );
  }

  // 有数据时显示
  const rankDisplay = slot.rank ? RANK_DISPLAY[slot.rank] : null;
  const formattedDate = slot.updatedAt
    ? new Date(slot.updatedAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const formatPlaytime = (seconds?: number): string => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  return (
    <button
      onClick={() => onLoad(slot.slotId)}
      className="w-full bg-white border-2 border-brand-200 hover:border-brand-400 hover:shadow-lg rounded-feishu p-4 transition-all text-left cursor-pointer"
    >
      {/* 槽位编号 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">
          槽位 {slot.slotId}
        </span>
        {rankDisplay && (
          <div className="flex items-center gap-1">
            <span className="text-lg">{rankDisplay.icon}</span>
            <span className="text-sm font-medium" style={{ color: rankDisplay.color }}>
              {rankDisplay.label}
            </span>
          </div>
        )}
      </div>

      {/* 玩家信息 */}
      <div className="space-y-2">
        {/* 玩家名 */}
        {slot.playerName && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <span className="text-base font-bold text-slate-800">{slot.playerName}</span>
          </div>
        )}

        {/* 季度进度 */}
        {slot.currentQuarter !== undefined && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>📅</span>
            <span>第 {slot.currentQuarter} 季度</span>
          </div>
        )}

        {/* 更新时间和游戏时长 */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          {formattedDate && <span>更新于 {formattedDate}</span>}
          {slot.playtime && <span>游戏时长 {formatPlaytime(slot.playtime)}</span>}
        </div>
      </div>
    </button>
  );
};

interface SaveSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  saves: SaveSlot[];
  onLoad: (slotId: 1 | 2) => void;
}

const SaveSlotModal: React.FC<SaveSlotModalProps> = ({ isOpen, onClose, saves, onLoad }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-feishu-lg shadow-feishu-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* 标题 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💾</span>
            <h2 className="text-lg font-bold text-slate-800">选择存档</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 存档槽位列表 */}
        <div className="p-4 space-y-3">
          {saves.map((save) => (
            <SaveSlotCard key={save.slotId} slot={save} onLoad={onLoad} />
          ))}
        </div>

        {/* 取消按钮 */}
        <div className="p-4 border-t border-slate-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-feishu cursor-pointer transition-colors text-sm sm:text-base"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSlotModal;
