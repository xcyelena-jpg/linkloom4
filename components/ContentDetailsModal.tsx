
import React, { useState, useRef } from 'react';
import { X, Trash2, ExternalLink, Image as ImageIcon, ChevronDown, Star, Plus, Upload, Camera, AlertCircle } from 'lucide-react';
import { ContentItem } from '../types';
import PlatformIcon from './PlatformIcon';

interface ContentDetailsModalProps {
  item: ContentItem | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ContentItem>) => void;
  onDelete: (id: string) => void;
  existingFolders: string[];
}

const ContentDetailsModal: React.FC<ContentDetailsModalProps> = ({ item, onClose, onUpdate, onDelete, existingFolders }) => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  const handleUpdateFolder = (newFolder: string) => {
    onUpdate(item.id, { folder: newFolder });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      handleUpdateFolder(newFolderName.trim());
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  };

  const handleUpdateNotes = (notes: string) => {
    onUpdate(item.id, { notes });
  };

  const handleToggleFavorite = () => {
    onUpdate(item.id, { isFavorite: !item.isFavorite });
  };

  const handleTriggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
           const currentImages = item.noteImages || [];
           onUpdate(item.id, { noteImages: [...currentImages, reader.result] });
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const handleDeleteImage = (index: number) => {
     const currentImages = item.noteImages || [];
     const updated = currentImages.filter((_, i) => i !== index);
     onUpdate(item.id, { noteImages: updated });
  };

  const confirmDelete = () => {
    onDelete(item.id);
    onClose();
  };

  return (
    <>
    <div className="fixed inset-0 z-[80] bg-white dark:bg-zinc-950 flex flex-col md:flex-row animate-in fade-in duration-200">
      
      {/* Mobile Close Button - White Circle Black X */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-md md:hidden flex items-center justify-center active:scale-95 transition-transform"
      >
        <X className="w-5 h-5 text-black" />
      </button>

      {/* Left / Top: Visuals */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-zinc-100 dark:bg-zinc-900 relative group">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
           {item.thumbnailUrl ? (
             <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="cover" />
           ) : (
             <PlatformIcon type={item.platform} className="w-20 h-20 opacity-20" />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
             <div className="flex items-center gap-2 mb-3">
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-xs font-bold uppercase flex items-center gap-1.5 border border-white/10">
                   <PlatformIcon type={item.platform} className="w-3.5 h-3.5 text-white" />
                   {item.platform}
                </span>
             </div>
             <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight shadow-black drop-shadow-md line-clamp-3">
               {item.title}
             </h1>
           </div>
        </div>
      </div>

      {/* Right / Bottom: Details & Edit */}
      <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-white dark:bg-zinc-950 relative">
        
        {/* Header Desktop - White Circle Black X */}
        <div className="hidden md:flex justify-end p-4 border-b border-zinc-100 dark:border-zinc-800">
           <button onClick={onClose} className="p-2 bg-white text-black rounded-full shadow-sm border border-zinc-200 hover:bg-zinc-50 transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-24">
          
          {/* Actions Row: Open & Favorite */}
          <div className="flex gap-3 h-14">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noreferrer"
              className="flex-1 h-full bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" />
              Open in {item.platform}
            </a>
            
            <button 
              onClick={handleToggleFavorite}
              className={`h-full aspect-square rounded-xl flex items-center justify-center transition-all border active:scale-90 shadow-sm ${
                item.isFavorite 
                  ? 'bg-yellow-400 text-yellow-900 border-yellow-400 shadow-yellow-500/20' 
                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <Star className={`w-6 h-6 ${item.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Folder Edit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Folder</label>
            <div className="flex gap-2">
              {isCreatingFolder ? (
                 <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-left-2">
                    <input 
                      type="text" 
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New folder name..."
                      className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                      autoFocus
                    />
                    <button 
                      onClick={handleCreateFolder}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsCreatingFolder(false)}
                      className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                 </div>
              ) : (
                <>
                  <div className="relative flex-1">
                    <select 
                      value={item.folder}
                      onChange={(e) => handleUpdateFolder(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-zinc-900 dark:text-zinc-100 transition-shadow"
                    >
                      {existingFolders.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <button 
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex-shrink-0 w-12 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                <span>Notes</span>
                <span className="text-[10px] font-normal normal-case opacity-60 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Auto-saves</span>
             </label>
             <textarea 
               value={item.notes || ''}
               onChange={(e) => handleUpdateNotes(e.target.value)}
               placeholder="Add your thoughts, summaries, or key takeaways here..."
               className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
             />
          </div>

          {/* Image Notes */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Attached Images</label>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button 
                onClick={handleTriggerFileUpload}
                className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" /> 
                <span>Attach</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
               {(item.noteImages || []).map((img, idx) => (
                 <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100">
                    <img src={img} alt="note" className="w-full h-full object-cover" />
                    <button 
                       onClick={() => handleDeleteImage(idx)}
                       className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-red-500"
                    >
                       <X className="w-3 h-3" />
                    </button>
                 </div>
               ))}
               {(item.noteImages || []).length === 0 && (
                  <button 
                    onClick={handleTriggerFileUpload}
                    className="col-span-2 py-8 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                     <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5 text-zinc-400" />
                     </div>
                     <p className="text-xs font-medium">Upload or take photo</p>
                  </button>
               )}
            </div>
          </div>

          {/* Delete Button (Bottom) */}
          <div className="pt-4 pb-4">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3.5 text-red-500 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Collection
            </button>
          </div>

        </div>
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
         <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xs p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
           <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 mx-auto text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
           </div>
           <h3 className="text-lg font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2">Delete this item?</h3>
           <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
             This action cannot be undone. The collection will be permanently removed.
           </p>
           <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={() => setShowDeleteConfirm(false)}
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

export default ContentDetailsModal;
