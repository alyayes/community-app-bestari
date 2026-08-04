import React from 'react';
import { NotificationItem } from '../../types';

interface SemuaNotifikasiModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onMarkAllRead: () => void;
  onClickNotification: (id: string) => void;
}

export const SemuaNotifikasiModal: React.FC<SemuaNotifikasiModalProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onDelete,
  onClearAll,
  onMarkAllRead,
  onClickNotification,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433A30]/50 backdrop-blur-sm">
      <div className="bg-[#FAF6EE] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-[#E6E1D5]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E6E1D5] bg-white">
          <div>
            <h2 className="font-title font-bold text-lg sm:text-xl text-[#2C4219]">Semua Notifikasi</h2>
            <p className="text-xs text-[#7A7062] mt-1">Lihat dan kelola semua pemberitahuan Anda.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#433A30] hover:bg-[#E6E1D5] flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 bg-[#E3EAD3]/30 border-b border-[#E6E1D5]">
            <button
              onClick={onMarkAllRead}
              className="text-[10px] sm:text-xs font-bold text-[#2C4219] hover:text-[#1E2E11] transition-colors"
            >
              Tandai Semua Dibaca
            </button>
            <button
              onClick={onClearAll}
              className="text-[10px] sm:text-xs font-bold text-[#C53030] hover:text-[#9B2C2C] transition-colors"
            >
              Bersihkan Semua
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#E6E1D5]/50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#7A7062]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="font-bold text-[#433A30]">Tidak Ada Notifikasi</p>
              <p className="text-xs text-[#7A7062] mt-1">Anda sudah melihat semua pemberitahuan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`relative group p-4 rounded-2xl border transition-all ${
                    !notif.isRead 
                      ? 'bg-white border-[#A8B774] shadow-sm' 
                      : 'bg-white/50 border-[#E6E1D5] opacity-75'
                  }`}
                >
                  {!notif.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#A8B774]" />
                  )}
                  
                  <div className="pr-8 cursor-pointer" onClick={() => {
                    onClickNotification(notif.id);
                    onClose();
                  }}>
                    <span className="inline-block px-2 py-1 bg-[#E3EAD3] text-[#2C4219] font-bold text-[10px] rounded mb-2">
                      {notif.category}
                    </span>
                    <h3 className={`font-bold text-sm sm:text-base ${!notif.isRead ? 'text-[#2C4219]' : 'text-[#433A30]'}`}>
                      {notif.title}
                    </h3>
                    <p className="text-xs text-[#7A7062] mt-1.5 leading-relaxed">
                      {notif.summary}
                    </p>
                    <p className="text-[10px] font-bold text-[#A8B774] mt-3 uppercase tracking-wider">
                      {notif.postedTime}
                    </p>
                  </div>

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {!notif.isRead && (
                      <button
                        onClick={() => onMarkRead(notif.id)}
                        className="p-1.5 rounded bg-[#FAF6EE] text-[#A8B774] hover:text-[#2C4219] hover:bg-[#E3EAD3] transition-colors"
                        title="Tandai Dibaca"
                      >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(notif.id)}
                      className="p-1.5 rounded bg-[#FAF6EE] text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
