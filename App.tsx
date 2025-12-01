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
import { ContentItem, PlatformDefaults } from './types';
import { Plus, Search, Menu, Star, X, Clock, ChevronDown, Folder as FolderIcon } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'linkloom_items_v2';
const LOCAL_STORAGE_PLATFORMS_KEY = 'linkloom_platforms_v1';
const LOCAL_STORAGE_FOLDERS_KEY = 'linkloom_folders_v1';

// Initial data for demo purposes if empty
const DEMO_DATA: ContentItem[] = [
  {
    id: '1',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up - Rick Astley (Official Video)',
    description: 'Classic music video, essential for internet culture history.',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    platform: PlatformDefaults.YOUTUBE,
    tags: ['Music', 'Classic', 'Meme'],
    folder: 'Entertainment',
    summary: 'Rick Astley\'s hit song known for the "Rickroll" internet meme.',
    isFavorite: true,
    createdAt: Date.now() - 10000000
  },
  {
    id: '2',
    url: 'https://www.xiaohongshu.com/explore',
    title: 'Shanghai Coffee Shop Guide 2024',
    description: 'A curated list of aesthetic coffee shops in Xuhui district.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop', 
    platform: PlatformDefaults.XIAOHONGSHU,
    tags: ['Travel', 'Food', 'Coffee'],
    folder: 'Lifestyle',
    summary: 'Guide to the best coffee spots in Shanghai.',
    isFavorite: false,
    createdAt: Date.now() - 5000000
  },
  {
    id: '3',
    url: 'https://www.youtube.com/watch?v=1',
    title: 'Figma Auto Layout Tutorial',
    description: 'Tutorial on responsive design.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop',
    platform: PlatformDefaults.YOUTUBE,
    tags: ['Design', 'Figma', 'UI/UX'],
    folder: 'Design',
    summary: 'Deep dive into Figma auto-layout features.',
    isFavorite: false,
    createdAt: Date.now() - 2000000
  },
  {
    id: '4',
    url: 'https://douyin.com',
    title: 'Street Photography Tips',
    description: 'How to take better photos at night.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
    platform: PlatformDefaults.DOUYIN,
    tags: ['Photo', 'Art'],
    folder: 'Skills',
    summary: 'Night photography techniques.',
    isFavorite: false,
    createdAt: Date.now() - 1000000
  }
];

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
    // If no saved folders, check items for unique folders, otherwise use defaults
    if (!saved) {
      const foldersFromItems = new Set<string>();
      DEMO_DATA.forEach(item => foldersFromItems.add(item.folder));
      DEFAULT_FOLDERS.forEach(f => foldersFromItems.add(f));
      return Array.from(foldersFromItems).sort();
    }
    return JSON.parse(saved);
  });

  // UI State
  const [activeFolderTab, setActiveFolderTab] = useState<string>('RECENT'); // Primary Tab (Topic)
  const [activePlatformFilter, setActivePlatformFilter] = useState<string | null>(null); // Sidebar Filter (Source)
  const [showFavorites, setShowFavorites] = useState(false); // Favorites

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState(false);
  const [isFolderSelectionOpen, setIsFolderSelectionOpen] = useState(false);
  
  // Folder UI State
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [folderOptionsState, setFolderOptionsState] = useState<{ isOpen: boolean; folder: string | null }>({
    isOpen: false,
    folder: null
  });
  const [isManageFoldersModalOpen, setIsManageFoldersModalOpen] = useState(false); // Opened from Tab Bar

  // Detail View State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Content Options Drawer State (Long Press)
  const [contentOptionsId, setContentOptionsId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{message: string, isVisible: boolean}>({ message: '', isVisible: false });

  // Swipe State Refs
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndYRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  // Animation Direction
  const [slideDirection, setSlideDirection] = useState(0); // 1 = right, -1 = left
  const prevTabRef = useRef(activeFolderTab);

  // Persistence
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PLATFORMS_KEY, JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_FOLDERS_KEY, JSON.stringify(folders));
  }, [folders]);

  // Handle Tab Change Animation Direction
  const visibleFolders = useMemo(() => folders.filter(f => f !== 'General'), [folders]);
  const allTabs = useMemo(() => ['RECENT', ...visibleFolders], [visibleFolders]);

  useEffect(() => {
    const prevIndex = allTabs.indexOf(prevTabRef.current);
    const currIndex = allTabs.indexOf(activeFolderTab);
    if (currIndex > prevIndex) setSlideDirection(1);
    else if (currIndex < prevIndex) setSlideDirection(-1);
    else setSlideDirection(0);
    
    prevTabRef.current = activeFolderTab;
  }, [activeFolderTab, allTabs]);


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
    
    // Auto-add platform to tabs if it doesn't exist and isn't Other
    if (newItem.platform !== PlatformDefaults.OTHER && !platforms.includes(newItem.platform)) {
      setPlatforms(prev => [...prev, newItem.platform]);
    }

    // Auto-add folder if new
    if (!folders.includes(item.folder)) {
      setFolders(prev => [...prev, item.folder].sort());
    }

    // --- RESET VIEW TO SHOW NEW ITEM ---
    setActiveFolderTab('RECENT');
    setActivePlatformFilter(null);
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
    // Check if folder update is a new folder
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

  // Platform Management
  const handleAddPlatform = (name: string) => {
     if (name && !platforms.includes(name)) {
        setPlatforms([...platforms, name]);
        showToast(`Added ${name}`);
     }
  };

  const handleDeletePlatform = (platform: string) => {
     setPlatforms(prev => prev.filter(p => p !== platform));
     if (activePlatformFilter === platform) setActivePlatformFilter(null);
     showToast('Platform Removed');
  };

  const handleReorderPlatforms = (newOrder: string[]) => {
    setPlatforms(newOrder);
  };

  // Folder Management Logic
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
    if (activeFolderTab === oldName) setActiveFolderTab(newName);
    showToast('Folder Renamed');
  };

  const handleDeleteFolder = (folderName: string) => {
    const remainingFolders = folders.filter(f => f !== folderName);
    const fallbackFolder = remainingFolders.includes('General') 
      ? 'General' 
      : (remainingFolders[0] || 'Uncategorized');

    setFolders(prev => prev.filter(f => f !== folderName));
    setItems(prev => prev.map(item => item.folder === folderName ? { ...item, folder: fallbackFolder } : item));
    
    if (activeFolderTab === folderName) setActiveFolderTab('RECENT');
    showToast('Folder Deleted');
  };

  // Swipe Navigation Logic (Optimized with useRef)
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
        if (Math.abs(distanceY) > Math.abs(distanceX) * 0.8) {
            isHorizontalSwipe = false;
        }
    }
    
    if (isHorizontalSwipe && (isLeftSwipe || isRightSwipe)) {
        const currentIndex = allTabs.indexOf(activeFolderTab);
        
        if (isLeftSwipe && currentIndex < allTabs.length - 1) {
            setActiveFolderTab(allTabs[currentIndex + 1]);
        }
        
        if (isRightSwipe && currentIndex > 0) {
            setActiveFolderTab(allTabs[currentIndex - 1]);
        }
    }
  };


  // Derived state for filtering
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Text Search
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      // 2. Tab Filter (Folder)
      if (activeFolderTab !== 'RECENT') {
        if (item.folder !== activeFolderTab) return false;
      }

      // 3. Sidebar Filter (Platform)
      if (activePlatformFilter) {
        if (item.platform !== activePlatformFilter) return false;
      }

      // 4. Favorites Filter
      if (showFavorites && !item.isFavorite) {
        return false;
      }

      return true;
    });
  }, [items, activeFolderTab, activePlatformFilter, searchQuery, showFavorites]);

  const selectedItem = useMemo(() => items.find(i => i.id === selectedItemId) || null, [items, selectedItemId]);
  const contentOptionsItem = useMemo(() => items.find(i => i.id === contentOptionsId) || null, [items, contentOptionsId]);

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      
      <Toast 
        message={toast.message} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      {/* Desktop Sidebar / Mobile Drawer */}
      <div className={`fixed inset-0 z-50 md:static md:z-0 flex ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none md:pointer-events-auto'}`}>
        {/* Backdrop for mobile */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar Content */}
        <div className={`
          relative w-[280px] h-full bg-zinc-50 dark:bg-zinc-900/95 border-r border-zinc-200 dark:border-zinc-800 
          transform transition-transform duration-300 shadow-2xl md:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
           <Sidebar 
            activePlatform={activePlatformFilter} 
            showFavorites={showFavorites}
            onPlatformChange={(p) => { setActivePlatformFilter(p); setIsMobileMenuOpen(false); }}
            onToggleFavorites={(f) => { setShowFavorites(f); setIsMobileMenuOpen(false); }}
            platforms={platforms}
            totalCount={items.length}
            onManagePlatforms={() => setIsAddPlatformModalOpen(true)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main 
        className="flex-1 flex flex-col h-screen overflow-hidden relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        
        {/* Mobile Header - Glassmorphism Enhanced */}
        <header className="h-14 flex items-center justify-between px-4 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
             <button 
                className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full active:bg-zinc-200 md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
             >
                <Menu className="w-6 h-6" />
             </button>
             
             {/* Title */}
             <button 
                onClick={() => setIsFolderSelectionOpen(true)}
                className="flex items-center gap-2 overflow-hidden active:opacity-70 transition-opacity min-w-0 text-left"
             >
               {showFavorites && <Star className="w-4 h-4 text-yellow-500 fill-current shrink-0" />}
               <h1 className="text-lg font-bold truncate">
                 {showFavorites ? 'My Favorites' : (activeFolderTab === 'RECENT' ? 'LinkLoom' : activeFolderTab)}
               </h1>
               <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
             </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
             <button 
               onClick={() => setIsSearchOpen(!isSearchOpen)}
               className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
             >
               {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
             </button>
          </div>
        </header>

        {/* Search Bar Expandable */}
        {isSearchOpen && (
           <div className="px-4 py-2 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-2 z-10">
              <input
                  type="text"
                  placeholder="Search titles, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
           </div>
        )}

        {/* Sticky Tab Navigation - FOLDERS */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 flex items-center pr-4">
           
           {/* Scrollable Tabs Area */}
           <div className="flex-1 overflow-x-auto no-scrollbar flex items-center px-4 py-2 gap-3">
             
             {/* Recent Tab */}
             <button
               onClick={() => setActiveFolderTab('RECENT')}
               className={`flex-shrink-0 px-3 py-2 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 ${
                 activeFolderTab === 'RECENT'
                   ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                   : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
               }`}
             >
               <Clock className="w-3 h-3" />
               Recent
             </button>

             {/* Folder Tabs (Excluding General) */}
             {visibleFolders.map(f => (
                <button
                key={f}
                onClick={() => setActiveFolderTab(f)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-full border transition-all select-none ${
                  activeFolderTab === f
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
                }`}
              >
                <FolderIcon className="w-3.5 h-3.5" />
                {f}
              </button>
             ))}
           </div>

           {/* Fixed Add/Manage Folder Button (Right Side) */}
           <div className="flex-shrink-0 pl-2 relative z-20">
             <button 
                onClick={() => setIsManageFoldersModalOpen(true)}
                className="w-9 h-9 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-md active:scale-95 transition-all"
                title="Manage Collections"
             >
               <ManageIcon className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* Feed List (Swipeable with AnimatePresence) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar overflow-x-hidden">
           <AnimatePresence mode="wait" initial={false}>
             <motion.div
               key={activeFolderTab}
               initial={{ x: 100 * slideDirection, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -100 * slideDirection, opacity: 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="h-full"
             >
               {filteredItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[50vh]">
                    {/* Empty State Logic */}
                    {searchQuery ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-zinc-400" />
                            </div>
                            <p className="text-zinc-500 text-sm mb-4">No matches found for "{searchQuery}"</p>
                            <button 
                              onClick={() => setSearchQuery('')}
                              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-bold"
                            >
                              Clear Search
                            </button>
                        </div>
                    ) : (
                        // Ghost Card (Horizontal Style)
                        <button 
                          onClick={() => setIsAddModalOpen(true)}
                          className="group w-full max-w-2xl h-24 mx-auto rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                           <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Plus className="w-5 h-5 text-zinc-400" />
                           </div>
                           <p className="text-xs font-bold text-zinc-400">
                              Add to {activeFolderTab === 'RECENT' ? 'Collection' : activeFolderTab}
                           </p>
                        </button>
                    )}
                 </div>
               ) : (
                 <div className="flex flex-col gap-3 pb-24 max-w-2xl mx-auto w-full">
                   {filteredItems.map(item => (
                     <ContentCard 
                       key={item.id} 
                       item={item} 
                       onLongPress={(id) => setContentOptionsId(id)}
                       onToggleFavorite={handleToggleFavorite}
                       onClickTag={(tag) => {
                          // Clicking a tag/folder chip inside card now switches to that folder tab
                          setActiveFolderTab(tag);
                          setActivePlatformFilter(null);
                          setShowFavorites(false);
                       }}
                       onOpenDetails={(id) => setSelectedItemId(id)}
                     />
                   ))}
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Floating Action Button (FAB) */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-90"
        >
          <Plus className="w-7 h-7" />
        </button>

      </main>

      {/* Add Modal */}
      <AddContentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddItem}
        existingFolders={folders}
        existingPlatforms={platforms}
      />

      {/* Details Modal */}
      <ContentDetailsModal 
        item={selectedItem}
        onClose={() => setSelectedItemId(null)}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        existingFolders={folders}
      />

      {/* Content Options Drawer */}
      <ContentOptionsDrawer 
        isOpen={!!contentOptionsId}
        item={contentOptionsItem}
        availableFolders={folders}
        onClose={() => setContentOptionsId(null)}
        onRename={(id, title) => handleUpdateItem(id, { title })}
        onMove={(id, folder) => handleUpdateItem(id, { folder })}
        onDelete={handleDeleteItem}
        onToast={showToast}
      />

      {/* Add Platform Modal (Now opened from Sidebar) */}
      <AddPlatformModal
        isOpen={isAddPlatformModalOpen}
        onClose={() => setIsAddPlatformModalOpen(false)}
        onAdd={handleAddPlatform}
        platforms={platforms}
        onDelete={handleDeletePlatform}
        onReorder={handleReorderPlatforms}
      />

      {/* Manage Folders Modal (Now opened from Tab Bar) */}
      <ManageFoldersModal
        isOpen={isManageFoldersModalOpen}
        onClose={() => setIsManageFoldersModalOpen(false)}
        folders={folders}
        onAdd={handleAddFolder}
        onRename={handleRenameFolder}
        onDelete={handleDeleteFolder}
      />

      {/* Add Folder Modal (Simple version, if needed) */}
      <AddFolderModal 
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        onAdd={handleAddFolder}
      />

      {/* Folder Options Drawer */}
      <FolderOptionsDrawer
        isOpen={folderOptionsState.isOpen}
        folderName={folderOptionsState.folder}
        onClose={() => setFolderOptionsState({ isOpen: false, folder: null })}
        onRename={handleRenameFolder}
        onDelete={handleDeleteFolder}
      />

      {/* Folder Selection Drawer (From Header - acts as tab switcher) */}
      <FolderSelectionDrawer
        isOpen={isFolderSelectionOpen}
        onClose={() => setIsFolderSelectionOpen(false)}
        folders={folders}
        activeFilter={activeFolderTab === 'RECENT' ? null : activeFolderTab}
        showFavorites={showFavorites}
        onSelect={(f, isFav) => {
           if (isFav) {
             setShowFavorites(true);
             setActiveFolderTab('RECENT');
           } else {
             setActiveFolderTab(f || 'RECENT');
             setShowFavorites(false);
           }
        }}
      />

    </div>
  );
};

export default App;
