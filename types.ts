
export type PlatformType = string;

export const PlatformDefaults = {
  XIAOHONGSHU: 'XiaoHongShu',
  DOUYIN: 'Douyin',
  YOUTUBE: 'YouTube',
  OTHER: 'Other'
} as const;

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface ContentItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnailUrl?: string; // New: Cover image
  platform: PlatformType;
  tags: string[];
  folder: string; // New: Category/Folder
  summary?: string;
  isFavorite?: boolean; // New: Favorite status
  notes?: string; // New: User notes
  noteImages?: string[]; // New: User note images
  createdAt: number;
}

export interface AISuggestionResponse {
  tags: string[];
  summary: string;
  suggestedTitle?: string;
  suggestedFolder?: string; // New: AI suggested folder
}
