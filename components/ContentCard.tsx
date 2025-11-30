
import React, { useRef, useState } from 'react';
import { Star, Folder } from 'lucide-react';
import { ContentItem } from '../types';
import PlatformIcon from './PlatformIcon';

interface ContentCardProps {
  item: ContentItem;
  onLongPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClickTag: (tag: string) => void;
  onOpenDetails: (id: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onLongPress, onToggleFavorite, onClickTag, onOpenDetails }) => {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Handle Long Press Logic
  const handleTouchStart = () => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      // Trigger Options Drawer
      onLongPress(item.id);
      setIsPressed(false);
    }, 500); // 500ms for standard long press
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPressed(false);
  };

  const handleJump = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPressed) {
      window.open(item.url, '_blank');
    }
  };

  return (
    <div 
      className={`group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-row h-24 shadow-sm transition-all duration-200 select-none w-full ${isPressed ? 'scale-[0.98] border-indigo-400' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      
      {/* Left: Cover Image - Jump Area - Fixed Square w-24 h-full (96px) */}
      <div 
        className="relative w-24 h-full shrink-0 bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-100 dark:border-zinc-800 cursor-pointer active:opacity-80"
        onClick={handleJump}
      >
        {item.thumbnailUrl ? (
          <img 
            src={item.thumbnailUrl} 
            alt={item.title} 
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900">
             <PlatformIcon type={item.platform} className="w-6 h-6 opacity-40" />
          </div>
        )}
        
        {/* Subtle Jump Hint on Hover/Touch */}
        <div className="absolute inset-0 bg-black/0 active:bg-black/10 transition-colors" />
      </div>

      {/* Right: Content Info - Opens Details */}
      {/* Optimization: p-2 (was p-2.5) and justify-between to ensure footer stays at bottom without cutoff */}
      <div 
        className="flex-1 p-2 flex flex-col min-w-0 cursor-pointer justify-between active:bg-zinc-50 dark:active:bg-zinc-800 transition-colors"
        onClick={() => onOpenDetails(item.id)}
      >
        {/* Header: Platform + Title */}
        <div className="flex flex-col gap-0.5">
           <div className="flex items-center gap-1.5 opacity-60">
             <PlatformIcon type={item.platform} className="w-3 h-3" />
             <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{item.platform}</span>
           </div>
           {/* Optimization: leading-tight (was leading-snug) for tighter 2-line fit */}
           <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">
             {item.title}
           </h3>
        </div>

        {/* Footer: Folder + Favorite */}
        <div className="flex items-end justify-between">
           <div className="flex items-center gap-2">
             {/* Limited max-width to prevent overflow */}
             <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md max-w-[85px]">
               <Folder className="w-3 h-3 shrink-0" />
               <span className="truncate">{item.folder}</span>
             </div>
           </div>

           <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className={`p-1.5 rounded-lg transition-all active:scale-90 -mb-1 -mr-1 ${
              item.isFavorite 
                ? 'text-yellow-500' 
                : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
