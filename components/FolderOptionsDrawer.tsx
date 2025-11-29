
import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Folder, Check, AlertCircle } from 'lucide-react';

interface FolderOptionsDrawerProps {
  isOpen: boolean;
  folderName: string | null;
  onClose: () => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

const FolderOptionsDrawer: React.FC<FolderOptionsDrawerProps> = ({ 
  isOpen, 
  folderName, 
  onClose, 
  onRename, 
  onDelete 
}) => {
  const [view, setView] = useState<'menu' | 'rename' | 'delete'>('menu');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen && folderName) {
      setView('menu');
      setNewName(folderName);
    }
  }, [isOpen, folderName]);

  if (!isOpen || !folderName) return null;

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName !== folderName) {
      onRename(folderName, newName.trim());
      onClose();
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(folderName);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed z-[80] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[400px] animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
        {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
           <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        <div className="p-5">
           {/* Header */}
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                 {view === 'menu' && <Folder className="w-5 h-5 text-indigo-500" />}
                 {view === 'menu' && folderName}
                 {view === 'rename' && 'Rename Collection'}
                 {view === 'delete' && 'Delete Collection'}
              </h3>
              <button onClick={onClose} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                 <X className="w-4 h-4 text-zinc-500" />
              </button>
           </div>

           {/* MENU VIEW */}
           {view === 'menu' && (
             <div className="space-y-3">
               <button 
                 onClick={() => setView('rename')}
                 className="w-full flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
               >
                 <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">
                    <Edit2 className="w-5 h-5" />
                 </div>
                 <span className="font-semibold text-zinc-700 dark:text-zinc-200">Rename</span>
               </button>

               <button 
                 onClick={() => setView('delete')}
                 className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-left"
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
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <div className="flex gap-3">
                   <button type="button" onClick={() => setView('menu')} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 font-bold rounded-xl text-zinc-600 dark:text-zinc-300">Back</button>
                   <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20">Save</button>
                </div>
             </form>
           )}

           {/* DELETE VIEW */}
           {view === 'delete' && (
             <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <AlertCircle className="w-8 h-8" />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 px-4">
                   Are you sure you want to delete <strong>"{folderName}"</strong>? Items will be moved to 'General' (or the next available folder).
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

export default FolderOptionsDrawer;
