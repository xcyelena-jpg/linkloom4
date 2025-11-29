
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, ChevronDown, Plus, Check } from 'lucide-react';
import { PlatformDefaults, ContentItem } from '../types';
import { analyzeContent } from '../services/geminiService';
import PlatformIcon from './PlatformIcon';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ContentItem, 'id' | 'createdAt'>) => void;
  existingFolders: string[];
  existingPlatforms: string[];
}

const AddContentModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, onSave, existingFolders, existingPlatforms }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<string>(PlatformDefaults.OTHER);
  const [tags, setTags] = useState<string[]>([]);
  const [folder, setFolder] = useState('General');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [summary, setSummary] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Smart URL Handler: Extracts URL from text blobs (common in Douyin/TikTok shares)
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Regex to extract http/https link
    const urlMatch = val.match(/(https?:\/\/[^\s]+)/);
    
    if (urlMatch) {
       setUrl(urlMatch[0]); // Use the clean URL
    } else {
       setUrl(val); // Fallback to whatever user typed
    }
  };

  // Auto-detect platform & Thumbnail from URL (Sync logic)
  useEffect(() => {
    if (!url) return;
    
    const lowerUrl = url.toLowerCase();
    let detectedPlatform = platform;
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      detectedPlatform = PlatformDefaults.YOUTUBE;
      try {
        let videoId = '';
        if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
        
        if (videoId) {
           setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        }
      } catch (e) { console.log("Could not extract YT thumb"); }
    }
    else if (lowerUrl.includes('xiaohongshu.com')) detectedPlatform = PlatformDefaults.XIAOHONGSHU;
    else if (lowerUrl.includes('douyin.com')) detectedPlatform = PlatformDefaults.DOUYIN;
    else if (lowerUrl.includes('tiktok.com')) detectedPlatform = 'TikTok';
    else if (lowerUrl.includes('bilibili.com')) detectedPlatform = 'Bilibili';
    else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) detectedPlatform = 'Twitter';

    // Only update if it's different and not manually set to something specific (unless it's 'Other')
    if (detectedPlatform !== platform) {
       setPlatform(detectedPlatform);
    }
  }, [url]);

  // Auto-fetch Title/Metadata using oEmbed or CORS Proxy
  useEffect(() => {
    if (!url || !url.startsWith('http')) return;

    const fetchMetadata = async () => {
      setIsFetchingMetadata(true);
      const lowerUrl = url.toLowerCase();

      try {
        // STRATEGY 1: DOUYIN / TIKTOK via CORS Proxy
        // We fetch the page HTML directly via a proxy to find og:image and title
        if (lowerUrl.includes('douyin.com') || lowerUrl.includes('tiktok.com')) {
           const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
           const response = await fetch(proxyUrl);
           const html = await response.text();
           
           // Extract Title (look for <title> or og:title)
           const titleMatch = html.match(/<title>(.*?)<\/title>/) || html.match(/meta property="og:title" content="(.*?)"/);
           if (titleMatch && titleMatch[1]) {
              const cleanTitle = titleMatch[1]
                .replace('- 抖音', '')
                .replace('- TikTok', '')
                .trim();
              
              setTitle(prev => (!prev || prev === url) ? cleanTitle : prev);
           }

           // Extract Image (look for og:image)
           // Douyin/TikTok usually put the cover in og:image
           const imgMatch = html.match(/meta property="og:image" content="(.*?)"/);
           if (imgMatch && imgMatch[1]) {
              setThumbnailUrl(prev => (!prev) ? imgMatch[1] : prev);
           }
        } 
        // STRATEGY 2: Standard oEmbed (YouTube, Vimeo, etc.)
        else {
          const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
          const data = await response.json();

          if (data && !data.error) {
            setTitle(prev => {
               if (!prev || prev === url) return data.title;
               return prev;
            });
            setThumbnailUrl(prev => {
               if (!prev && data.thumbnail_url) return data.thumbnail_url;
               return prev;
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      } finally {
        setIsFetchingMetadata(false);
      }
    };

    const timer = setTimeout(fetchMetadata, 800); // Debounce 800ms
    return () => clearTimeout(timer);
  }, [url]);

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    try {
      // If title is empty, use URL as temp title for AI context
      const result = await analyzeContent(title || url, description, url);
      setTags(result.tags);
      setSummary(result.summary);
      if (result.suggestedTitle) setTitle(result.suggestedTitle);
      if (result.suggestedFolder) {
        setFolder(result.suggestedFolder);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setFolder(newFolderName.trim());
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      url,
      title: title || url, // Fallback to URL if title is empty
      description,
      platform,
      tags,
      summary,
      thumbnailUrl,
      folder
    });
    // Reset
    setUrl('');
    setTitle('');
    setDescription('');
    setTags([]);
    setSummary('');
    setThumbnailUrl('');
    setFolder('General');
    setNewFolderName('');
    setIsCreatingFolder(false);
    onClose();
  };

  if (!isOpen) return null;

  // Add the newly created folder to the list if it's not there yet
  const effectiveFolders = Array.from(new Set([
    ...existingFolders, 
    'General',
    folder
  ]));
  
  const displayPlatforms = Array.from(new Set([
    PlatformDefaults.YOUTUBE, 
    PlatformDefaults.XIAOHONGSHU, 
    PlatformDefaults.DOUYIN,
    ...existingPlatforms.filter(p => p !== 'ALL' && p !== 'All'),
    PlatformDefaults.OTHER
  ]));

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed z-[70] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[500px] max-h-[90vh] flex flex-col border-t md:border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        
        {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
           <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">New Collection</h2>
          <button onClick={onClose} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <form id="add-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. URL Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Link URL</label>
              <input
                required
                type="text" 
                value={url}
                onChange={handleUrlChange}
                placeholder="Paste content link..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none text-base"
                autoFocus
              />
            </div>

            {/* 2. Title Input with AI Button */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <span>Title</span>
                   {isFetchingMetadata && (
                      <span className="flex items-center gap-1 text-[10px] normal-case text-zinc-400 font-normal animate-pulse">
                         <Loader2 className="w-3 h-3 animate-spin" />
                         Fetching info...
                      </span>
                   )}
                </div>
                {title && !isAnalyzing && !isFetchingMetadata && <span className="text-[10px] text-green-500 font-normal animate-pulse">Auto-filled</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Content title"
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
                {/* AI Trigger Button Inside Title Input */}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url}
                  title="Auto-fill details with AI"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
              </div>
            </div>

             {/* 3. Platform */}
             <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Platform</label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {displayPlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`flex-shrink-0 min-w-[3rem] h-10 px-3 flex items-center justify-center gap-2 rounded-xl border transition-all ${
                        platform === p 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 bg-white dark:bg-zinc-800'
                      }`}
                      title={p}
                    >
                      <PlatformIcon type={p} className="w-4 h-4" />
                      {platform === p && <span className="text-xs font-bold">{p}</span>}
                    </button>
                  ))}
                </div>
             </div>

             {/* 4. Folder (Last) */}
             <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Folder</label>
               <div className="flex gap-2 h-11">
                 {isCreatingFolder ? (
                    <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-left-2">
                       <input 
                         type="text" 
                         value={newFolderName}
                         onChange={(e) => setNewFolderName(e.target.value)}
                         placeholder="New folder name..."
                         className="flex-1 px-4 h-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateFolder())}
                       />
                       <button 
                         type="button"
                         onClick={handleCreateFolder}
                         className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                       >
                         <Check className="w-5 h-5" />
                       </button>
                       <button 
                         type="button"
                         onClick={() => setIsCreatingFolder(false)}
                         className="px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 rounded-xl"
                       >
                         <X className="w-5 h-5" />
                       </button>
                    </div>
                 ) : (
                   <>
                     <div className="relative flex-1">
                       <select 
                          value={folder}
                          onChange={(e) => setFolder(e.target.value)}
                          className="w-full h-full px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-sm font-medium"
                       >
                         {effectiveFolders.map(f => <option key={f} value={f}>{f}</option>)}
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                     </div>
                     <button 
                       type="button"
                       onClick={() => setIsCreatingFolder(true)}
                       className="flex-shrink-0 w-12 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                       title="Create new folder"
                     >
                       <Plus className="w-5 h-5" />
                     </button>
                   </>
                 )}
               </div>
             </div>

          </form>
        </div>

        {/* Footer Buttons */}
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 pb-8 md:pb-5">
           <button 
             form="add-form"
             type="submit" 
             disabled={!url}
             className="w-full py-3.5 text-base font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
           >
             Save Collection
           </button>
        </div>
      </div>
    </>
  );
};

export default AddContentModal;
