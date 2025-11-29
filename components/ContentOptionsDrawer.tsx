
import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Folder, Share2, Check, AlertCircle, Copy, Link as LinkIcon } from 'lucide-react';
import { ContentItem } from '../types';

interface ContentOptionsDrawerProps {
  isOpen: boolean;
  item: ContentItem | null;
  availableFolders: string[];
  onClose: () => void;
  onRename: (id: string, newTitle: string) => void;
  onMove: (id: string, newFolder: string) => void;
  onDelete: (id: string) => void;
  onToast: (msg: string) => void;
}

const ContentOptionsDrawer: React.FC<ContentOptionsDrawerProps> = ({ 
  isOpen, 
  item, 
  availableFolders,
  onClose, 
  onRename, 
  onMove,
  onDelete,
  onToast
}) => {
  const [view, setView] = useState<'menu' | 'rename' | 'folder' | 'delete'>('menu');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (isOpen && item) {
      setView('menu');
      setNewTitle(item.title);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newTitle !== item.title) {
      onRename(item.id, newTitle.trim());
      onClose();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: item.description || item.summary,
      url: item.url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onClose();
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(item.url);
        onToast('Link Copied'); // Use global toast
        setTimeout(() => {
            onClose();
        }, 300);
      } catch (err) {
        onToast('Failed to copy');
      }
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(item.id);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed z-[80] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[400px] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
        
        {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
           <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
           {/* Header */}
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate pr-4">
                 {view === 'menu' && <span className="truncate">{item.title}</span>}
                 {view === 'rename' && 'Rename Item'}
                 {view === 'folder' && 'Move to Collection'}
                 {view === 'delete' && 'Delete Item'}
              </h3>
              <button onClick={onClose} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full shrink-0">
                 <X className="w-4 h-4 text-zinc-500" />
              </button>
           </div>

           {/* MENU VIEW */}
           {view === 'menu' && (
             <div className="space-y-3">
               {/* Rename */}
               <button 
                 onClick={() => setView('rename')}
                 className="w-full flex items-center gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
               >
                 <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <Edit2 className="w-5 h-5" />
                 </div>
                 <span className="font-semibold text-zinc-700 dark:text-zinc-200">Rename</span>
               </button>
               
               {/* Share */}
               <button 
                 onClick={handleShare}
                 className="w-full flex items-center gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left relative"
               >
                 <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <Share2 className="w-5 h-5" />
                 </div>
                 <span className="font-semibold text-zinc-700 dark:text-zinc-200 flex-1">Share / Copy Link</span>
               </button>

               {/* Move Folder */}
               <button 
                 onClick={() => setView('folder')}
                 className="w-full flex items-center gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
               >
                 <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <Folder className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">Move to Collection</span>
                    <span className="text-xs text-zinc-400">Current: {item.folder}</span>
                 </div>
               </button>

               {/* Delete */}
               <button 
                 onClick={() => setView('delete')}
                 className="w-full flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-left mt-2"
               >
                 <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-red-500 shadow-sm border border-red-100 dark:border-red-900/20">
                    <Trash2 className="w-5 h-5" />
                 </div>
                 <span className="font-semibold text-red-600 dark:text-red-400">Delete</span>
               </button>
             </div>
           )}

           {/* RENAME VIEW */}
           {view === 'rename' && (
             <form onSubmit={handleRenameSubmit} className="space-y-4">
                <input 
                  autoFocus
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <div className="flex gap-3">
                   <button type="button" onClick={() => setView('menu')} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-xl text-zinc-600 dark:text-zinc-300">Back</button>
                   <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20">Save</button>
                </div>
             </form>
           )}

           {/* FOLDER VIEW */}
           {view === 'folder' && (
             <div className="space-y-2">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 mb-4">
                   {availableFolders.map(folder => (
                      <button
                        key={folder}
                        onClick={() => {
                            onMove(item.id, folder);
                            onClose();
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            item.folder === folder 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' 
                                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            <Folder className={`w-4 h-4 ${item.folder === folder ? 'fill-current' : ''}`} />
                            <span className="font-medium">{folder}</span>
                         </div>
                         {item.folder === folder && <Check className="w-4 h-4" />}
                      </button>
                   ))}
                </div>
                <button onClick={() => setView('menu')} className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-xl text-zinc-600 dark:text-zinc-300">Back</button>
             </div>
           )}

           {/* DELETE VIEW */}
           {view === 'delete' && (
             <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <AlertCircle className="w-8 h-8" />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 px-4">
                   Are you sure you want to delete this item?
                </p>
                <div className="flex gap-3">
                   <button onClick={() => setView('menu')} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-xl text-zinc-600 dark:text-zinc-300">Cancel</button>
                   <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30">Delete</button>
                </div>
             </div>
           )}

        </div>
      </div>
    </>
  );
};

export default ContentOptionsDrawer;
