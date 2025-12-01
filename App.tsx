import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ContentCard from './components/ContentCard';
import AddContentModal from './components/AddContentModal';
import ContentDetailsModal from './components/ContentDetailsModal';
import AddPlatformModal from './components/AddPlatformModal';
import AddFolderModal from './components/AddFolderModal';
import FolderOptionsDrawer from './components/FolderOptionsDrawer';
import ContentOptionsDrawer from './components/ContentOptionsDrawer';
import FolderSelectionDrawer from './components/FolderSelectionDrawer';
import ManageFoldersModal from './components/ManageFoldersModal';
import Toast from './components/Toast';
import PlatformIcon from './components/PlatformIcon';
import { ContentItem, PlatformDefaults } from './types';
import { Plus, Search, Menu, Star, X, Clock, ChevronDown, LayoutGrid } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'linkloom_items_v2';
const LOCAL_STORAGE_PLATFORMS_KEY = 'linkloom_platforms_v1';
const LOCAL_STORAGE_FOLDERS_KEY = 'linkloom_folders_v1';

const DEMO_DATA: ContentItem[] = []; // Empty default or your demo data

const DEFAULT_FOLDERS = ['General', 'Inspiration', 'Education', 'Entertainment', 'Shopping', 'Lifestyle', 'Design', 'Skills'];

// Custom Icon for Manager (Grid with Plus)
const ManageIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 17.5h7m-3.5-3.5v7" />
  </svg>
);

const App: React.FC = () => {
  // Items State
  const [items, setItems] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEMO_DATA;
  });

  // Platform Tabs State
  const [platforms, setPlatforms] = useState<string[]>(() => {
     const saved = localStorage.getItem(LOCAL_STORAGE_PLATFORMS_KEY);
     return saved ? JSON.parse(saved) : [PlatformDefaults.YOUTUBE, PlatformDefaults.DOUYIN, PlatformDefaults.XIAOHONGSHU];
  });

  // Folders State
  const [folders, setFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_FOLDERS_KEY);
    if (!saved) {
      const foldersFromItems = new Set<string>();
      DEMO_DATA.forEach(item => foldersFromItems.add(item.folder));
      DEFAULT_FOLDERS.forEach(f => foldersFromItems.add(f));
      return Array.from(foldersFromItems).sort();
    }
    return JSON.parse(saved);
  });

  // UI State - REVERTED TO YESTERDAY'S LOGIC
  // Top Tabs = Platforms (Source)
  // Sidebar = Folders (Topic)
  const [activePlatformTab, setActivePlatformTab] = useState<string>('RECENT'); 
  const [activeFolderFilter, setActiveFolderFilter] = useState<string | null>(null); 
  const [showFavorites, setShowFavorites] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState(false); // Opened from Top Tab
  const [isManageFoldersModalOpen, setIsManageFoldersModalOpen] = useState(false); // Opened from Sidebar
  
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [folderOptionsState, setFolderOptionsState] = useState<{ isOpen: boolean; folder: string | null }>({
    isOpen: false,
    folder: null
  });

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [contentOptionsId, setContentOptionsId] = useState<string | null>(null);
  const [isFolderSelectionOpen, setIsFolderSelectionOpen] = useState(false);

  const [toast, setToast] = useState<{message: string, isVisible: boolean}>({ message: '', isVisible: false });

  // Swipe State
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndYRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const [slideDirection, setSlideDirection] = useState(0);
  const prevTabRef = useRef(activePlatformTab);

  // Persistence
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PLATFORMS_KEY, JSON.stringify(platforms)); }, [platforms]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_FOLDERS_KEY, JSON.stringify(folders)); }, [folders]);

  // Tabs for animation
  const allTabs = useMemo(() => ['RECENT', ...platforms], [platforms]);

  useEffect(() => {
    const prevIndex = allTabs.indexOf(prevTabRef.current);
    const currIndex = allTabs.indexOf(activePlatformTab);
    if (currIndex > prevIndex) setSlideDirection(1);
    else if (currIndex < prevIndex) setSlideDirection(-1);
    else setSlideDirection(0);
    prevTabRef.current = activePlatformTab;
  }, [activePlatformTab, allTabs]);

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const handleAddItem = (newItem: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const item: ContentItem = {
      ...newItem,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isFavorite: false
    };
    setItems(prev => [item, ...prev]);
    
    if (newItem.platform !== PlatformDefaults.OTHER && !platforms.includes(newItem.platform)) {
      setPlatforms(prev => [...prev, newItem.platform]);
    }
    if (!folders.includes(item.folder)) {
      setFolders(prev => [...prev, item.folder].sort());
    }

    setActivePlatformTab('RECENT');
    setActiveFolderFilter(null);
    setShowFavorites(false);
    setSearchQuery('');
    showToast('Collection Saved!');
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
    showToast('Item Deleted');
  };

  const handleUpdateItem = (id: string, updates: Partial<ContentItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    if (updates.folder && !folders.includes(updates.folder)) {
      setFolders(prev => [...prev, updates.folder!].sort());
    }
  };

  const handleToggleFavorite = (id: string) => {
     setItems(prev => prev.map(item => {
        if (item.id === id) {
          if (!item.isFavorite) showToast('Added to Favorites');
          return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
     }));
  };

  const handleAddPlatform = (name: string) => {
     if (name && !platforms.includes(name)) {
        setPlatforms([...platforms, name]);
        showToast(`Added ${name}`);
     }
  };
  const handleDeletePlatform = (platform: string) => {
     setPlatforms(prev => prev.filter(p => p !== platform));
     if (activePlatformTab === platform) setActivePlatformTab('RECENT');
     showToast('Platform Removed');
  };
  const handleReorderPlatforms = (newOrder: string[]) => { setPlatforms(newOrder); };

  const handleAddFolder = (name: string) => {
    if (name && !folders.includes(name)) {
      setFolders(prev => [...prev, name].sort());
      showToast(`Folder Created`);
    }
  };
  const handleRenameFolder = (oldName: string, newName: string) => {
    if (!newName || folders.includes(newName)) return;
    setFolders(prev => prev.map(f => f === oldName ? newName : f).sort());
    setItems(prev => prev.map(item => item.folder === oldName ? { ...item, folder: newName } : item));
    if (activeFolderFilter === oldName) setActiveFolderFilter(newName);
    showToast('Folder Renamed');
  };
  const handleDeleteFolder = (folderName: string) => {
    const remainingFolders = folders.filter(f => f !== folderName);
    const fallbackFolder = remainingFolders.includes('General') ? 'General' : (remainingFolders[0] || 'Uncategorized');
    setFolders(prev => prev.filter(f => f !== folderName));
    setItems(prev => prev.map(item => item.folder === folderName ? { ...item, folder: fallbackFolder } : item));
    if (activeFolderFilter === folderName) setActiveFolderFilter(null);
    showToast('Folder Deleted');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchEndYRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
    touchEndYRef.current = e.targetTouches[0].clientY;
  };
  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distanceX = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    
    let isHorizontalSwipe = true;
    if (touchStartYRef.current !== null && touchEndYRef.current !== null) {
        const distanceY = touchStartYRef.current - touchEndYRef.current;
        if (Math.abs(distanceY) > Math.abs(distanceX) * 0.8) isHorizontalSwipe = false;
    }
    
    if (isHorizontalSwipe && (isLeftSwipe || isRightSwipe)) {
        const currentIndex = allTabs.indexOf(activePlatformTab);
        if (isLeftSwipe && currentIndex < allTabs.length - 1) setActivePlatformTab(allTabs[currentIndex + 1]);
        if (isRightSwipe && currentIndex > 0) setActivePlatformTab(allTabs[currentIndex - 1]);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // Filter by Top Tab (Platform)
      if (activePlatformTab !== 'RECENT') {
        if (item.platform !== activePlatformTab) return false;
      }
      // Filter by Sidebar (Folder)
      if (activeFolderFilter) {
        if (item.folder !== activeFolderFilter) return false;
      }
      if (showFavorites && !item.isFavorite) return false;

      return true;
    });
  }, [items, activePlatformTab, activeFolderFilter, searchQuery, showFavorites]);

  const selectedItem = useMemo(() => items.find(i => i.id === selectedItemId) || null, [items, selectedItemId]);
  const contentOptionsItem = useMemo(() => items.find(i => i.id === contentOptionsId) || null, [items, contentOptionsId]);

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      <Toast message={toast.message} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

      {/* Sidebar */}
      <div className={`fixed inset-0 z-50 md:static md:z-0 flex ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none md:pointer-events-auto'}`}>
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`relative w-[280px] h-full bg-zinc-50 dark:bg-zinc-900/95 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 shadow-2xl md:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
           <Sidebar 
            activeFolder={activeFolderFilter} 
            showFavorites={showFavorites}
            onFolderChange={(f) => { setActiveFolderFilter(f); setIsMobileMenuOpen(false); }}
            onToggleFavorites={(f) => { setShowFavorites(f); setIsMobileMenuOpen(false); }}
            folders={folders}
            totalCount={items.length}
            onManageFolders={() => setIsManageFoldersModalOpen(true)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
             <button className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full active:bg-zinc-200 md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-6 h-6" />
             </button>
             <button onClick={() => setIsFolderSelectionOpen(true)} className="flex items-center gap-2 overflow-hidden active:opacity-70 transition-opacity min-w-0 text-left">
               {showFavorites && <Star className="w-4 h-4 text-yellow-500 fill-current shrink-0" />}
               <h1 className="text-lg font-bold truncate">
                 {showFavorites ? 'My Favorites' : (activePlatformTab === 'RECENT' ? 'All Items' : activePlatformTab)}
               </h1>
               <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
             </button>
          </div>
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
             {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </header>

        {isSearchOpen && (
           <div className="px-4 py-2 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-2 z-10">
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
           </div>
        )}

        {/* Tabs: PLATFORMS */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 flex items-center pr-4">
           <div className="flex-1 overflow-x-auto no-scrollbar flex items-center px-4 py-2 gap-3">
             <button
               onClick={() => setActivePlatformTab('RECENT')}
               className={`flex-shrink-0 px-3 py-2 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 ${activePlatformTab === 'RECENT' ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'}`}
             >
               <Clock className="w-3 h-3" />
               Recent
             </button>
             {platforms.map(p => (
                <button
                key={p}
                onClick={() => setActivePlatformTab(p)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-full border transition-all select-none ${activePlatformTab === p ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'}`}
              >
                <PlatformIcon type={p} className="w-3.5 h-3.5" />
                {p}
              </button>
             ))}
           </div>
           <div className="flex-shrink-0 pl-2 relative z-20">
             <button onClick={() => setIsAddPlatformModalOpen(true)} className="w-9 h-9 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-md active:scale-95 transition-all">
               <ManageIcon className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar overflow-x-hidden">
           <AnimatePresence mode="wait" initial={false}>
             <motion.div
               key={activePlatformTab + (activeFolderFilter || '')}
               initial={{ x: 100 * slideDirection, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -100 * slideDirection, opacity: 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="h-full"
             >
               {filteredItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[50vh]">
                    <button onClick={() => setIsAddModalOpen(true)} className="group w-full max-w-2xl h-24 mx-auto rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                       <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5 text-zinc-400" />
                       </div>
                       <p className="text-xs font-bold text-zinc-400">Add Item</p>
                    </button>
                 </div>
               ) : (
                 <div className="flex flex-col gap-3 pb-24 max-w-2xl mx-auto w-full">
                   {filteredItems.map(item => (
                     <ContentCard 
                       key={item.id} item={item} onLongPress={(id) => setContentOptionsId(id)} onToggleFavorite={handleToggleFavorite}
                       onClickTag={(tag) => { setActiveFolderFilter(tag); setActivePlatformTab('RECENT'); setShowFavorites(false); }}
                       onOpenDetails={(id) => setSelectedItemId(id)}
                     />
                   ))}
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-90"><Plus className="w-7 h-7" /></button>
      </main>

      <AddContentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddItem} existingFolders={folders} existingPlatforms={platforms} />
      <ContentDetailsModal item={selectedItem} onClose={() => setSelectedItemId(null)} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} existingFolders={folders} />
      <ContentOptionsDrawer isOpen={!!contentOptionsId} item={contentOptionsItem} availableFolders={folders} onClose={() => setContentOptionsId(null)} onRename={(id, t) => handleUpdateItem(id, { title: t })} onMove={(id, f) => handleUpdateItem(id, { folder: f })} onDelete={handleDeleteItem} onToast={showToast} />
      <AddPlatformModal isOpen={isAddPlatformModalOpen} onClose={() => setIsAddPlatformModalOpen(false)} onAdd={handleAddPlatform} platforms={platforms} onDelete={handleDeletePlatform} onReorder={handleReorderPlatforms} />
      <ManageFoldersModal isOpen={isManageFoldersModalOpen} onClose={() => setIsManageFoldersModalOpen(false)} folders={folders} onAdd={handleAddFolder} onRename={handleRenameFolder} onDelete={handleDeleteFolder} />
      <AddFolderModal isOpen={isAddFolderModalOpen} onClose={() => setIsAddFolderModalOpen(false)} onAdd={handleAddFolder} />
      <FolderOptionsDrawer isOpen={folderOptionsState.isOpen} folderName={folderOptionsState.folder} onClose={() => setFolderOptionsState({ isOpen: false, folder: null })} onRename={handleRenameFolder} onDelete={handleDeleteFolder} />
      <FolderSelectionDrawer isOpen={isFolderSelectionOpen} onClose={() => setIsFolderSelectionOpen(false)} folders={folders} activeFilter={activeFolderFilter} showFavorites={showFavorites} onSelect={(f, fav) => { if(fav){setShowFavorites(true);setActiveFolderFilter(null);}else{setActiveFolderFilter(f);setShowFavorites(false);} }} />
    </div>
  );
};
