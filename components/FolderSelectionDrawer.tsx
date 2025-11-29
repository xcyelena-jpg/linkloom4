
import React from 'react';
import { X, LayoutGrid, Star, Folder, Check } from 'lucide-react';

interface FolderSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
  activeFilter: string | null;
  showFavorites: boolean;
  onSelect: (folder: string | null, isFav: boolean) => void;
}

const FolderSelectionDrawer: React.FC<FolderSelectionDrawerProps> = ({ 
  isOpen, 
  onClose, 
  folders, 
  activeFilter, 
  showFavorites, 
  onSelect 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed z-[80] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[400px] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
        {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
           <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-800">
           <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Select Collection</h3>
           <button onClick={onClose} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
             <X className="w-4 h-4 text-zinc-500" />
           </button>
        </div>

        <div className="p-2 overflow-y-auto custom-scrollbar flex-1 space-y-1">
           {/* All Items */}
           <button
             onClick={() => { onSelect(null, false); onClose(); }}
             className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
               activeFilter === null && !showFavorites 
                 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                 : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
             }`}
           >
              <div className="flex items-center gap-3">
                 <LayoutGrid className="w-5 h-5" />
                 <span className="font-semibold">All Items</span>
              </div>
              {activeFilter === null && !showFavorites && <Check className="w-4 h-4" />}
           </button>

           {/* Favorites */}
           <button
             onClick={() => { onSelect(null, true); onClose(); }}
             className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
               showFavorites 
                 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' 
                 : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
             }`}
           >
              <div className="flex items-center gap-3">
                 <Star className="w-5 h-5" />
                 <span className="font-semibold">Favorites</span>
              </div>
              {showFavorites && <Check className="w-4 h-4" />}
           </button>
           
           <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-3" />
           <p className="px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Collections</p>

           {/* Folders List */}
           {folders.map(folder => (
             <button
               key={folder}
               onClick={() => { onSelect(folder, false); onClose(); }}
               className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                 activeFilter === folder && !showFavorites
                   ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                   : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
               }`}
             >
                <div className="flex items-center gap-3">
                   <Folder className={`w-5 h-5 ${activeFilter === folder ? 'fill-current' : ''}`} />
                   <span className="font-medium truncate">{folder}</span>
                </div>
                {activeFilter === folder && !showFavorites && <Check className="w-4 h-4" />}
             </button>
           ))}
        </div>
      </div>
    </>
  );
};

export default FolderSelectionDrawer;
