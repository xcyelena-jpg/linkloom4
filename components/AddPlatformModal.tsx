
import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, GripVertical } from 'lucide-react';
import PlatformIcon from './PlatformIcon';

interface AddPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
  platforms: string[];
  onDelete: (name: string) => void;
  onReorder: (platforms: string[]) => void;
}

const AddPlatformModal: React.FC<AddPlatformModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  platforms, 
  onDelete,
  onReorder
}) => {
  const [name, setName] = useState('');
  const [platformToDelete, setPlatformToDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  const confirmDelete = () => {
    if (platformToDelete) {
      onDelete(platformToDelete);
      setPlatformToDelete(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed z-[80] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[400px] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
         {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
           <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

         {/* Header */}
         <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Manage Platforms</h3>
            <button onClick={onClose} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <X className="w-4 h-4 text-zinc-500" />
            </button>
         </div>
         
         {/* Body */}
         <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
            {/* Add Section */}
            <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
               <input 
                 autoFocus
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="New platform..."
                 className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
               />
               <button 
                 type="submit"
                 disabled={!name.trim()}
                 className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center shadow-lg shadow-indigo-500/20"
               >
                 <Plus className="w-5 h-5" />
               </button>
            </form>

            {/* List Section */}
            <div>
               <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">Active Tabs</h4>
               <div className="space-y-2">
                 {platforms.length === 0 && (
                    <div className="text-center py-8 text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                        No platforms added yet.
                    </div>
                 )}
                 {platforms.map((p, index) => (
                   <div key={p} className="flex items-center justify-between p-2.5 pl-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-left-2 duration-300 group">
                      <div className="flex items-center gap-3">
                         {/* Grip Icon for visual cue */}
                         <div className="text-zinc-300 dark:text-zinc-600 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                         </div>
                         
                         <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 shadow-sm">
                            <PlatformIcon type={p} className="w-5 h-5" />
                         </div>
                         <span className="font-bold text-zinc-700 dark:text-zinc-200">{p}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          {/* Delete */}
                          <button 
                            onClick={() => setPlatformToDelete(p)}
                            className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors ml-1"
                            title="Remove"
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
         </div>
       </div>

       {/* Delete Confirmation Overlay (Nested Modal) */}
       {platformToDelete && (
         <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xs p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 mx-auto text-red-600 dark:text-red-400">
                 <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">Remove Platform?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
                Are you sure you want to remove <strong>"{platformToDelete}"</strong> from your tabs?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPlatformToDelete(null)}
                  className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="py-3 px-4 text-white font-bold bg-red-600 hover:bg-red-700 rounded-xl text-sm shadow-lg shadow-red-500/30"
                >
                  Remove
                </button>
              </div>
            </div>
         </div>
       )}
    </>
  );
};

export default AddPlatformModal;
