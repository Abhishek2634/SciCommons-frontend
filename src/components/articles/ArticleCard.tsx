import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Star } from 'lucide-react';

import { ArticlesListOut } from '@/api/schemas';
import { useIsMounted, useMode } from '@/hooks/useMode';
import { cn } from '@/lib/utils';

import RenderParsedHTML from '../common/RenderParsedHTML';
import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';

interface ArticleCardProps {
  article: ArticlesListOut;
  forCommunity?: boolean;
  className?: string;
  compactType?: 'minimal' | 'default' | 'full';
  handleArticlePreview?: (article: ArticlesListOut) => void;
}

const ArticleCard: FC<ArticleCardProps> = ({
  article,
  forCommunity,
  className,
  compactType = 'full',
  handleArticlePreview,
}) => {
  const mode = useMode();
  const isMounted = useIsMounted();
  const isSimpleMode = isMounted && mode === 'simple';

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-common-contrast bg-common-cardBackground p-4 res-text-xs hover:shadow-md hover:shadow-common-minimal',
        className,
        {
          'border-none bg-transparent p-0 hover:shadow-none': compactType === 'minimal',
          'gap-0.5 rounded-none border-none bg-transparent p-0 hover:shadow-none':
            isSimpleMode && compactType === 'default',
          'gap-0': isSimpleMode && (compactType === 'full' || compactType === 'default'),
          'text-xs': isSimpleMode && (compactType === 'full' || compactType === 'default'),
        }
      )}
      suppressHydrationWarning
      onClick={() => {
        if (compactType === 'default') {
          handleArticlePreview?.(article);
        }
      }}
    >
      <div className="flex">
        <div className="min-w-0 flex-grow gap-4 pr-4">
          <Link
            href={
              forCommunity
                ? `/community/${article.community_article?.community.name}/articles/${article.slug}`
                : `/article/${article.slug}`
            }
          >
            {/* <h2 className="line-clamp-2 text-wrap font-semibold text-text-primary res-text-lg hover:underline">
              {article.title}
            </h2> */}
            <div style={isSimpleMode ? { fontSize: '0.875rem' } : undefined}>
              <RenderParsedHTML
                rawContent={article.title}
                supportLatex={true}
                supportMarkdown={false}
                contentClassName={cn(
                  'line-clamp-2 text-wrap font-semibold text-text-primary hover:underline',
                  isSimpleMode
                    ? 'text-sm [&>*]:text-sm [&_p]:text-sm [&_span]:text-sm [&_div]:text-sm [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_h4]:text-sm [&_h5]:text-sm [&_h6]:text-sm'
                    : 'res-text-xl [&_*]:res-text-xl [&_p]:res-text-xl [&_span]:res-text-xl [&_h1]:res-text-xl [&_h2]:res-text-xl [&_h3]:res-text-xl [&_h4]:res-text-xl [&_h5]:res-text-xl [&_h6]:res-text-xl',
                  {
                    'line-clamp-1 sm:text-base text-base [&_*]:text-base [&_p]:text-base [&_span]:text-base [&_h1]:text-base [&_h2]:text-base [&_h3]:text-base [&_h4]:text-base [&_h5]:text-base [&_h6]:text-base':
                      (compactType === 'minimal' || compactType === 'default') && !isSimpleMode,
                    'underline underline-text-tertiary hover:text-functional-green':
                      compactType === 'minimal',
                  }
                )}
                containerClassName="mb-0"
              />
            </div>
          </Link>
          {/* <p className="mt-2 line-clamp-2 overflow-hidden text-ellipsis text-wrap text-text-primary">
            {article.abstract}
          </p> */}
          {compactType === 'full' && (
            <RenderParsedHTML
              rawContent={article.abstract}
              supportLatex={true}
              supportMarkdown={false}
              contentClassName="mt-2 line-clamp-2 text-wrap text-xs text-text-primary"
              containerClassName="mb-0"
            />
          )}
          {compactType === 'full' && (
            <p className="mt-2 line-clamp-2 text-wrap text-xs text-text-secondary">
              Authors: {article.authors.map((author) => author.label).join(', ')}
            </p>
          )}
          {compactType === 'full' && article.community_article?.community.name && (
            <p className="mt-1 flex flex-wrap items-center text-xs text-text-secondary">
              <span className="whitespace-nowrap">Published Community/Journal:</span>
              <Link
                href={`/community/${article.community_article?.community.name}`}
                className="ml-1 text-functional-blue hover:underline"
              >
                <span className="whitespace-nowrap">
                  {article.community_article?.community.name}
                </span>
              </Link>
            </p>
          )}
          {(compactType === 'full' || compactType === 'default') && (
            <p
              className={cn(
                'text-xs text-text-secondary',
                isSimpleMode ? 'mb-0 mt-0 text-[10px]' : 'mt-1'
              )}
            >
              Submitted By: {article.user.username}
            </p>
          )}
          {/* <div className="mt-2 flex flex-wrap">
            {article.keywords.map((keyword, index) => (
              <span
                key={index}
                className="mb-2 mr-2 rounded bg-common-minimal px-2.5 py-0.5 font-medium text-gray-800"
              >
                {keyword}
              </span>
            ))}
          </div> */}
        </div>
        {compactType !== 'minimal' && article.article_image_url && (
          <div className="ml-4 flex-none">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40">
              <Image
                src={article.article_image_url}
                alt="Article Image"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        )}
      </div>
      {(compactType === 'full' || compactType === 'default') && (
        <div className={cn('flex flex-wrap items-center gap-4', isSimpleMode && 'mt-0 gap-0')}>
          <div
            className={cn(
              'flex items-center',
              isSimpleMode && 'gap-1 p-0',
              !isSimpleMode && 'w-fit rounded-md border border-common-minimal py-1 pl-0 pr-1.5'
            )}
          >
            {isSimpleMode ? (
              <span
                className={cn('m-0 p-0 text-xs text-text-secondary', isSimpleMode && 'text-[10px]')}
              >
                Ratings: {article.total_ratings}
              </span>
            ) : (
              <>
                <Star className="h-3.5 text-functional-yellow" fill="currentColor" />
                <span className="text-xs text-text-secondary">{article.total_ratings}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;

export const ArticleCardSkeleton: React.FC = () => {
  return (
    <Skeleton className="flex flex-row items-start gap-4 overflow-hidden rounded-xl border border-common-contrast bg-common-cardBackground p-4">
      <div className="w-full space-y-2">
        <TextSkeleton className="h-6 w-3/4" />
        <TextSkeleton />
        <TextSkeleton />
        <TextSkeleton className="w-56" />
        <TextSkeleton className="w-3/4" />
        <div className="flex gap-4">
          {[...Array(3)].map((_, index) => (
            <TextSkeleton key={index} className="h-6 w-16" />
          ))}
        </div>
      </div>
      <BlockSkeleton className="hidden aspect-square size-20 sm:size-24 md:size-32 lg:block lg:size-40" />
    </Skeleton>
  );
};
