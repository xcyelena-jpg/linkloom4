
import React, { useEffect } from 'react';
import { Check, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 2000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-zinc-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2.5 min-w-[140px] justify-center">
         <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 stroke-[3]" />
         </div>
         <span className="text-sm font-semibold tracking-wide">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
