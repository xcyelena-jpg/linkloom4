
import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Folder, AlertCircle } from 'lucide-react';

interface ManageFoldersModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: string[];
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

const ManageFoldersModal: React.FC<ManageFoldersModalProps> = ({ 
  isOpen, 
  onClose, 
  folders, 
  onAdd, 
  onRename, 
  onDelete 
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; folder: string | null }>({
    isOpen: false,
    folder: null
  });

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAdd(newFolderName.trim());
      setNewFolderName('');
    }
  };

  const startEditing = (folder: string) => {
    setEditingFolder(folder);
    setEditValue(folder);
  };

  const saveEdit = () => {
    if (editingFolder && editValue.trim() && editValue !== editingFolder) {
      onRename(editingFolder, editValue.trim());
    }
    setEditingFolder(null);
  };
  
  const initiateDelete = (folder: string) => {
    setDeleteConfirm({ isOpen: true, folder });
  };

  const confirmDelete = () => {
    if (deleteConfirm.folder) {
      onDelete(deleteConfirm.folder);
      setDeleteConfirm({ isOpen: false, folder: null });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 rounded-t-2xl">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-500" />
                Manage Collections
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
          </div>
          
          {/* Body */}
          <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Add Section */}
              <form onSubmit={handleAddSubmit} className="flex gap-2 mb-6">
                <input 
                  autoFocus
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New collection name..."
                  className="flex-1 px-3 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button 
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              {/* List Section */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">Your Folders</h4>
                <div className="space-y-3">
                  {folders.map(folder => (
                    <div key={folder} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 transition-colors">
                        
                        {editingFolder === folder ? (
                          <div className="flex-1 flex gap-2 mr-2 animate-in fade-in">
                            <input 
                              className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-indigo-500 rounded-lg outline-none shadow-sm"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                              autoFocus
                            />
                            <button onClick={saveEdit} className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                <Folder className="w-4 h-4 text-indigo-500" />
                            </div>
                            <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200 truncate">{folder}</span>
                          </div>
                        )}

                        <div className="flex gap-3 shrink-0 ml-2">
                          {editingFolder !== folder && (
                            <button 
                              onClick={() => startEditing(folder)}
                              className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-zinc-700 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 rounded-lg transition-all"
                              title="Rename"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => initiateDelete(folder)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-white dark:hover:bg-zinc-700 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 rounded-lg transition-all"
                            disabled={folder === 'General'} // Prevent deleting default
                            title="Delete"
                            style={{ opacity: folder === 'General' ? 0.3 : 1 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xs p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
             <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 mx-auto text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">Delete Collection?</h3>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6 leading-relaxed">
               Are you sure you want to delete <strong>"{deleteConfirm.folder}"</strong>? <br/>
               <span className="text-xs opacity-75 block mt-2">Items in this folder will be moved to 'General'.</span>
             </p>
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setDeleteConfirm({ isOpen: false, folder: null })}
                 className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-sm"
               >
                 Cancel
               </button>
               <button 
                 onClick={confirmDelete}
                 className="py-3 px-4 text-white font-bold bg-red-600 hover:bg-red-700 rounded-xl text-sm shadow-lg shadow-red-500/30"
               >
                 Delete
               </button>
             </div>
           </div>
        </div>
      )}
    </>
  );
};

export default ManageFoldersModal;
