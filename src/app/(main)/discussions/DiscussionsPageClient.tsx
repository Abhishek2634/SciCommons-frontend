'use client';

import React, { Suspense, useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PanelLeft } from 'lucide-react';

import ArticleContentView from '@/components/articles/ArticleContentView';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import DiscussionsSidebar from './DiscussionsSidebar';

interface SelectedArticle {
  id: number;
  title: string;
  slug: string;
  abstract: string;
  communityId: number | null;
  communityArticleId: number | null;
  isAdmin: boolean;
  communityName: string;
}

const DiscussionsPageClientInner: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedArticle, setSelectedArticle] = useState<SelectedArticle | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: When navigating to article page and using back button, sidebar resets to top article
     Solution: Store selected article ID in URL params and restore scroll position
     Result: Selected article and scroll position preserved across navigation */

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleArticleSelect = (article: SelectedArticle) => {
    setSelectedArticle(article);
    // Update URL with selected article ID
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('articleId', article.id.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    // Close mobile sidebar when article is selected
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Clicking PDF viewer in discussions should open article page, then back button should return
     Solution: Navigate to article page with returnTo=discussions and articleId params
     Result: Browser back naturally returns to discussions with preserved article selection */
  const handleOpenPdfViewer = () => {
    if (selectedArticle) {
      const params = new URLSearchParams();
      params.set('returnTo', 'discussions');
      params.set('articleId', selectedArticle.id.toString());
      router.push(`/article/${selectedArticle.slug}?${params.toString()}`);
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="flex items-center gap-2 border-b border-common-contrast bg-common-background px-4 py-3">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" isOpen={isMobileSidebarOpen} className="w-80 p-0">
              <SheetTitle className="sr-only">Discussions Sidebar</SheetTitle>
              <DiscussionsSidebar
                onArticleSelect={handleArticleSelect}
                selectedArticle={selectedArticle}
              />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-text-primary">
            {selectedArticle ? selectedArticle.title : 'Discussions'}
          </h1>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-auto">
          {selectedArticle ? (
            <div className="p-4">
              {/* Refactored by Claude Sonnet 4.5 on 2026-02-09: Use shared ArticleContentView
                  instead of duplicating article fetching, reviews, and tabs logic */}
              <ArticleContentView
                articleSlug={selectedArticle.slug}
                articleId={selectedArticle.id}
                communityId={selectedArticle.communityId}
                communityArticleId={selectedArticle.communityArticleId}
                communityName={selectedArticle.communityName}
                isAdmin={selectedArticle.isAdmin}
                showPdfViewerButton={true}
                handleOpenPdfViewer={handleOpenPdfViewer}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <EmptyState
                content="Select an article to view discussions"
                subcontent="Choose an article from the sidebar to see its discussions"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Resizable Sidebar */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full border-r border-common-contrast bg-common-cardBackground">
            <DiscussionsSidebar
              onArticleSelect={handleArticleSelect}
              selectedArticle={selectedArticle}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={75} minSize={60}>
          <div className="h-full overflow-auto">
            {selectedArticle ? (
              <div className="p-4 md:p-6">
                {/* Refactored by Claude Sonnet 4.5 on 2026-02-09: Use shared ArticleContentView
                    instead of duplicating article fetching, reviews, and tabs logic */}
                <ArticleContentView
                  articleSlug={selectedArticle.slug}
                  articleId={selectedArticle.id}
                  communityId={selectedArticle.communityId}
                  communityArticleId={selectedArticle.communityArticleId}
                  communityName={selectedArticle.communityName}
                  isAdmin={selectedArticle.isAdmin}
                  showPdfViewerButton={true}
                  handleOpenPdfViewer={handleOpenPdfViewer}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  content="Select an article to view discussions"
                  subcontent="Choose an article from the sidebar to see its discussions"
                />
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

const DiscussionsPageClient: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
          <EmptyState
            content="Loading discussions..."
            subcontent="Please wait while we load your subscriptions"
          />
        </div>
      }
    >
      <DiscussionsPageClientInner />
    </Suspense>
  );
};

export default DiscussionsPageClient;
