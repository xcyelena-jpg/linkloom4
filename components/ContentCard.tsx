
import React, { useRef, useState } from 'react';
import { Star } from 'lucide-react';
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

  const handleJump = () => {
    if (!isPressed) {
      window.open(item.url, '_blank');
    }
  };

  return (
    <div 
      className={`group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-full shadow-sm transition-all duration-200 select-none ${isPressed ? 'scale-95 border-indigo-400' : 'hover:shadow-md'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()} // Prevent native context menu on long press
    >
      
      {/* Cover Image Section - Jump Area */}
      <div 
        className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden cursor-pointer active:opacity-90"
        onClick={handleJump}
      >
        {item.thumbnailUrl ? (
          <img 
            src={item.thumbnailUrl} 
            alt={item.title} 
            className="w-full h-full object-cover pointer-events-none" // prevent img drag interference
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900">
             <PlatformIcon type={item.platform} className="w-10 h-10 opacity-50 mb-2" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 pointer-events-none"></div>

        {/* Platform Badge (Top Left) */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 text-white border border-white/10 shadow-sm pointer-events-none">
          <PlatformIcon type={item.platform} className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold tracking-wide uppercase">{item.platform}</span>
        </div>

        {/* Favorite Button (Bottom Right) - Changed to Star */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent jump when clicking star
            onToggleFavorite(item.id);
          }}
          className={`absolute bottom-2 right-2 p-2 rounded-lg backdrop-blur-md border transition-all active:scale-75 shadow-lg ${
            item.isFavorite 
              ? 'bg-yellow-400 text-yellow-900 border-yellow-400' 
              : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
          }`}
        >
          <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Info - Opens Details */}
      <div 
        className="p-3 flex flex-col flex-grow cursor-pointer active:bg-zinc-50 dark:active:bg-zinc-800 transition-colors"
        onClick={() => onOpenDetails(item.id)}
      >
        {/* Title */}
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Minimal Info Row - Removed Tags */}
        <div className="flex justify-between items-center mt-auto">
           <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded truncate max-w-[100px]">
             {item.folder}
           </span>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
