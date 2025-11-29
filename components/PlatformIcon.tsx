
import React from 'react';
import { Youtube, Video, Link as LinkIcon, Hash, Twitter, Facebook, Instagram } from 'lucide-react';

interface PlatformIconProps {
  type: string;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ type, className = "w-5 h-5" }) => {
  const lowerType = type.toLowerCase();

  if (lowerType.includes('youtube')) {
    return <Youtube className={`${className} text-red-600`} />;
  }
  if (lowerType.includes('xiaohongshu') || lowerType.includes('xhs') || lowerType === '小红书') {
     return <div className={`${className} flex items-center justify-center bg-red-500 text-white rounded-md text-[10px] font-bold`}>书</div>;
  }
  if (lowerType.includes('douyin') || lowerType.includes('tiktok') || lowerType === '抖音') {
    return <Video className={`${className} text-black dark:text-white`} />;
  }
  if (lowerType.includes('twitter') || lowerType.includes('x.com')) {
    return <Twitter className={`${className} text-blue-400`} />;
  }
  if (lowerType.includes('facebook')) {
    return <Facebook className={`${className} text-blue-600`} />;
  }
  if (lowerType.includes('instagram')) {
    return <Instagram className={`${className} text-pink-500`} />;
  }
  if (lowerType.includes('bilibili')) {
     return <div className={`${className} flex items-center justify-center bg-blue-400 text-white rounded-md text-[10px] font-bold`}>B</div>;
  }

  // Default / Other
  // If it's a short name (<=2 chars), try to show it as text badge
  if (type.length <= 2) {
    return <div className={`${className} flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-md text-[10px] font-bold uppercase`}>{type}</div>;
  }

  return <LinkIcon className={`${className} text-zinc-400`} />;
};

export default PlatformIcon;
