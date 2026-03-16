'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Bookmark, 
  ChevronDown, 
  Github, 
  MessageSquare, 
  Sparkles, 
  ThumbsUp, 
  BookOpen 
} from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import { ArticlesListOut } from '@/api/schemas';
import { Skeleton, BlockSkeleton, TextSkeleton } from '../common/Skeleton';

interface ArticleCardProps {
  article: ArticlesListOut;
  className?: string;
  forCommunity?: boolean;
  compactType?: 'full' | 'compact';
  handleArticlePreview?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  className, 
  forCommunity,
  compactType = 'full' 
}) => {
  const articleUrl = `/article/${article.slug}`;
  const viewCount = Math.floor(Math.random() * 5000); 

  return (
    <div className={cn(
      "group relative flex w-full gap-4 mb-4 mx-1 rounded-2xl border border-common-minimal bg-common-cardBackground p-5 transition-all hover:border-functional-blue/30 hover:shadow-xl",
      className
    )}>
      {/* Left Content Section */}
      <div className="flex flex-1 flex-col">
        <Link href={articleUrl}>
          <h2 className="mb-2 text-xl font-bold text-text-primary decoration-functional-blue group-hover:underline">
            {article.title}
          </h2>
        </Link>

        <div className="flex items-center gap-2">
  {article.authors.slice(0, 3).map((author: any, idx: number) => (
    <span key={idx} className="text-text-secondary hover:text-functional-blue cursor-pointer">
      {/* FIX: Access the label property if it's an object, otherwise render as string */}
      {typeof author === 'object' ? author.label : author}
      {idx < Math.min(article.authors.length, 3) - 1 ? ',' : ''}
    </span>
  ))}
  {article.authors.length > 3 && (
    <span className="text-text-tertiary">+{article.authors.length - 3} more</span>
  )}
</div>

        <div className="relative mb-4 flex gap-3">
          <Sparkles className="mt-1 h-4 w-4 shrink-0 text-functional-blue" />
          <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
            {article.abstract}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-common-minimal/50 px-3 py-1.5 hover:bg-common-minimal cursor-pointer">
              <ThumbsUp size={16} className="text-text-secondary" />
              <span className="text-xs font-bold text-text-secondary">50</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-common-minimal/50 px-3 py-1.5 hover:bg-common-minimal cursor-pointer">
              <Bookmark size={16} className="text-text-secondary" />
              <span className="text-xs font-bold text-text-secondary">Bookmark</span>
            </div>
          </div>

          <Link href={articleUrl} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110">
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Right Thumbnail Section */}
      {/* Right Thumbnail Section */}
<div className="relative hidden w-40 shrink-0 md:block"> {/* Reduced width from 48 to 40 */}
  <div className="relative h-56 w-full overflow-hidden rounded-xl border border-common-minimal bg-black/20 shadow-inner">
    <div className="flex h-full w-full items-center justify-center bg-zinc-900/50 text-[10px] text-zinc-500">
       <div className="p-4 italic text-center leading-tight">
          Visual Preview <br/> Coming Soon
       </div>
    </div>
    
    {/* View count Badge */}
    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 backdrop-blur-md border border-red-500/30">
      <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      {viewCount.toLocaleString()}
    </div>
  </div>
</div>
    </div>
  );
};

export default ArticleCard;

/**
 * RE-ADDED: Loading Skeleton 
 * This fixes the "got undefined" error in SearchableList
 */
export const ArticleCardSkeleton: React.FC = () => {
  return (
    <Skeleton className="flex w-full gap-4 rounded-2xl border border-common-minimal bg-common-cardBackground p-5">
      <div className="flex flex-1 flex-col gap-3">
        <TextSkeleton className="h-6 w-3/4" />
        <div className="flex gap-4">
          <TextSkeleton className="h-4 w-20" />
          <TextSkeleton className="h-4 w-32" />
        </div>
        <BlockSkeleton className="h-20 w-full rounded-lg" />
        <div className="mt-auto flex justify-between">
          <div className="flex gap-2">
            <BlockSkeleton className="h-8 w-16 rounded-md" />
            <BlockSkeleton className="h-8 w-24 rounded-md" />
          </div>
          <BlockSkeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="hidden w-48 md:block">
        <BlockSkeleton className="h-64 w-full rounded-xl" />
      </div>
    </Skeleton>
  );
};