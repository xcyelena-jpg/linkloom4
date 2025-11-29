
import React, { useState } from 'react';
import { X, Folder, Plus } from 'lucide-react';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-500" />
            New Collection
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <input 
            autoFocus
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name..."
            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-6"
          />
          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
          >
            Create Collection
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFolderModal;
