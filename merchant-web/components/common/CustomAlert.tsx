import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Info, X } from 'lucide-react';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  confirmText?: string;
}

export function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  confirmText = 'OK',
}: CustomAlertProps) {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-9 h-9 text-[#2E7D32]" />;
      case 'error':
        return <ShieldAlert className="w-9 h-9 text-[#C0392B]" />;
      case 'warning':
        return <AlertCircle className="w-9 h-9 text-[#D97706]" />;
      default:
        return <Info className="w-9 h-9 text-[#1565C0]" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-[#E7F2E7]';
      case 'error':
        return 'bg-[#F8E6E2]';
      case 'warning':
        return 'bg-[#FBF0D9]';
      default:
        return 'bg-[#E3F2FD]';
    }
  };

  const getButtonBg = () => {
    switch (type) {
      case 'success':
        return 'bg-[#2E7D32] hover:bg-[#225F26]';
      case 'error':
        return 'bg-[#C0392B] hover:bg-[#962A1F]';
      case 'warning':
        return 'bg-[#D97706] hover:bg-[#B26002]';
      default:
        return 'bg-[#1565C0] hover:bg-[#0D4D96]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col items-center shadow-2xl border border-[#E7E5DA] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${getIconBg()}`}>
          {getIcon()}
        </div>
        <h3 className="text-[#1D261F] text-base font-bold mb-2 text-center">{title}</h3>
        <p className="text-[#6F6B5E] text-xs leading-relaxed text-center mb-5 whitespace-pre-line">{message}</p>
        <button
          onClick={onClose}
          className={`w-full py-2.5 px-4 rounded-lg text-white text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${getButtonBg()}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
