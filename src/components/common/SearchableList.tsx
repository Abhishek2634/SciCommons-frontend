import React, { useCallback, useEffect, useRef, useState } from 'react';

import { LayoutGrid, List, PanelLeft } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import EmptyState from '@/components/common/EmptyState';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

export enum LoadingType {
  PAGINATION = 'pagination',
  INFINITE_SCROLL = 'infinite_scroll',
  LOAD_MORE = 'load_more',
}

interface SearchableListProps<T> {
  onSearch: (term: string) => void;
  onLoadMore: (page: number) => void;
  renderItem: (item: T) => React.ReactNode;
  renderSkeleton: () => React.ReactNode;
  isLoading: boolean;
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage?: number;
  searchPlaceholder?: string;
  loadingType?: LoadingType;
  loadMoreText?: string;
  emptyStateContent: string;
  emptyStateSubcontent: string;
  emptyStateLogo: React.ReactNode;
  title?: string;
  listContainerClassName?: string;
  viewType?: 'grid' | 'list' | 'preview';
  showViewTypeIcons?: boolean;
  setViewType?: (viewType: 'grid' | 'list' | 'preview') => void;
  allowedViewTypes?: Array<'grid' | 'list' | 'preview'>;
  variant?: 'default' | 'minimal';
}

function SearchableList<T>({
  onSearch,
  onLoadMore,
  renderItem,
  renderSkeleton,
  isLoading,
  items,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage = 10,
  searchPlaceholder = 'Search...',
  loadingType = LoadingType.PAGINATION,
  loadMoreText = 'Load More',
  emptyStateContent,
  emptyStateSubcontent,
  emptyStateLogo,
  title,
  listContainerClassName = 'flex flex-col gap-4',
  showViewTypeIcons = false,
  viewType = 'grid',
  setViewType,
  allowedViewTypes,
  variant = 'default',
}: SearchableListProps<T>) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && currentPage < totalPages) {
      onLoadMore(currentPage + 1);
    }
  }, [isLoading, currentPage, totalPages, onLoadMore]);

  useEffect(() => {
    if (loadingType !== LoadingType.INFINITE_SCROLL) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.0 }
    );

    const currentObserverTarget = observerTarget.current;

    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [loadingType, handleLoadMore]);

  const hasMore = items.length < totalItems;

  const isMinimal = variant === 'minimal';
  const shouldShowResultsMeta = !isLoading && totalItems > 0;

  const ViewTypeControls = () =>
    showViewTypeIcons ? (
      <div className="flex items-center gap-2">
        {(!allowedViewTypes || allowedViewTypes.includes('grid')) && (
          <Button
            variant={viewType === 'grid' ? 'gray' : 'transparent'}
            className="aspect-square p-1"
            onClick={() => setViewType?.('grid')}
            disabled={isMinimal}
          >
            <ButtonIcon>
              <LayoutGrid size={18} className="text-text-secondary" />
            </ButtonIcon>
          </Button>
        )}
        {(!allowedViewTypes || allowedViewTypes.includes('list')) && !isMinimal && (
          <Button
            variant={viewType === 'list' ? 'gray' : 'transparent'}
            className="aspect-square p-1"
            onClick={() => setViewType?.('list')}
            disabled={isMinimal}
          >
            <ButtonIcon>
              <List size={18} className="text-text-secondary" />
            </ButtonIcon>
          </Button>
        )}
        {(!allowedViewTypes || allowedViewTypes.includes('preview')) && !isMinimal && (
          <Button
            variant={viewType === 'preview' ? 'gray' : 'transparent'}
            className="hidden aspect-square p-1 md:block"
            onClick={() => setViewType?.('preview')}
            disabled={isMinimal}
          >
            <ButtonIcon>
              <PanelLeft size={18} className="text-text-secondary" />
            </ButtonIcon>
          </Button>
        )}
      </div>
    ) : null;

  return (
    <div className={cn('space-y-4', isMinimal && 'space-y-2')}>
      <div
        className={cn(
          'mb-6 flex w-full flex-col items-center justify-between gap-8 pt-1 md:flex-row',
          isMinimal && 'mb-1 items-center gap-3 pt-0 md:justify-between'
        )}
      >
        {!isMinimal && title && (
          <h1 className="whitespace-nowrap text-3xl font-bold text-text-primary">{title}</h1>
        )}
        {isMinimal && title && (
          <h2 className="pb-0 text-base font-semibold text-text-primary">{title}</h2>
        )}
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            'max-w-[720px] text-text-primary focus-visible:ring-foreground',
            isMinimal && 'max-w-[360px] rounded-md border-common-minimal bg-transparent text-sm'
          )}
        />
      </div>

      {isMinimal && shouldShowResultsMeta && (
        <div className="-mt-1 flex items-center justify-between pt-0">
          <span className="text-xs text-text-tertiary">
            Results: {totalItems} {title}
          </span>
          <ViewTypeControls />
        </div>
      )}

      <div className={cn('flex h-fit flex-col space-y-4')}>
        {!isMinimal && shouldShowResultsMeta && (
          <div
            className={cn(
              'flex w-full items-center',
              showViewTypeIcons ? 'justify-between' : 'justify-start'
            )}
          >
            <span className="text-sm text-text-tertiary">
              Results: {totalItems} {title}
            </span>
            <ViewTypeControls />
          </div>
        )}
        <div className={cn(listContainerClassName, isMinimal && 'gap-2')}>
          {items.map((item, index) => (
            <div key={index}>{renderItem(item)}</div>
          ))}
          {isLoading &&
            Array.from({ length: 4 }, (_, index) => (
              <div key={`skeleton-${index}`}>{renderSkeleton()}</div>
            ))}
        </div>
        {!isLoading && items.length === 0 && (
          <EmptyState
            content={emptyStateContent}
            logo={emptyStateLogo}
            subcontent={emptyStateSubcontent}
          />
        )}
        {loadingType === LoadingType.INFINITE_SCROLL && hasMore && (
          <div ref={observerTarget} className="h-10" />
        )}
      </div>
      {loadingType === LoadingType.PAGINATION && totalPages > 1 && items.length > 0 && (
        <Pagination className="mt-4 text-text-secondary">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => onLoadMore(currentPage - 1)} />
              </PaginationItem>
            )}
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => onLoadMore(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext href="#" onClick={() => onLoadMore(currentPage + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
      {loadingType === LoadingType.LOAD_MORE && hasMore && (
        <Button onClick={handleLoadMore} disabled={isLoading} className="mt-4 w-full">
          {isLoading ? 'Loading...' : loadMoreText}
        </Button>
      )}
    </div>
  );
}

export default SearchableList;
