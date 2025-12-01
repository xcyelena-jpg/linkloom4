import React from 'react';
import { LayoutGrid, Star, Zap, Plus, Video } from 'lucide-react';
import PlatformIcon from './PlatformIcon';

interface SidebarProps {
  activePlatform: string | null;
  showFavorites: boolean;
  onPlatformChange: (platform: string | null) => void;
  onToggleFavorites: (show: boolean) => void;
  platforms: string[];
  totalCount: number;
  onManagePlatforms: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activePlatform, 
  showFavorites,
  onPlatformChange, 
  onToggleFavorites,
  platforms,
  totalCount,
  onManagePlatforms
}) => {
  return (
    <div className="w-full h-full flex flex-col p-5 overflow-y-auto">
      
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2 pt-2">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
           <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
           <h1 className="text-xl font-bold text-zinc-900 dark:text-white leading-none">LinkLoom</h1>
           <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-1">CONTENT HUB</p>
        </div>
      </div>

      {/* Main Nav (Library) */}
      <div className="space-y-1 mb-8">
        <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Library</p>
        
        {/* All Items */}
        <button
          onClick={() => {
            onPlatformChange(null);
            onToggleFavorites(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activePlatform === null && !showFavorites
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-4 h-4" />
            <span>All Platforms</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activePlatform === null && !showFavorites ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{totalCount}</span>
        </button>

        {/* My Favorites */}
        <button
          onClick={() => {
             onPlatformChange(null);
             onToggleFavorites(true);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            showFavorites
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' 
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
          <span>Favorites</span>
        </button>
      </div>

      {/* Platforms (Was Collections) */}
      <div className="space-y-1 flex-grow">
         <div className="flex items-center justify-between px-3 mb-3">
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Platforms</p>
           <button 
             onClick={onManagePlatforms}
             className="w-9 h-9 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-md active:scale-90 transition-transform"
             title="Manage Platforms"
           >
             <Plus className="w-5 h-5" />
           </button>
        </div>
        {platforms.map(platform => (
           <div key={platform} className="group relative flex items-center">
             <button
               onClick={() => {
                  onPlatformChange(platform);
                  onToggleFavorites(false);
               }}
               className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                 activePlatform === platform && !showFavorites
                   ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400' 
                   : 'text-zinc-600 dark:text-zinc-400 active:bg-zinc-100 dark:active:bg-zinc-800'
               }`}
             >
               <PlatformIcon type={platform} className="w-4 h-4" />
               <span className="truncate">{platform}</span>
             </button>
           </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
