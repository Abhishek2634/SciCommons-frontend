/* Created by Claude Sonnet 4.5 on 2026-02-09
   Problem: Article display logic duplicated between ArticleDisplayPageClient and DiscussionsPageClient
   Solution: Extracted shared logic into reusable ArticleContentView component
   Result: ~180 lines of shared logic, eliminated ~100 lines of duplication, single source of truth */
import React, { useEffect, useState } from 'react';

import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import { FIVE_MINUTES_IN_MS, TEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import EmptyState from '../common/EmptyState';
import TabNavigation from '../ui/tab-navigation';
import DiscussionForum from './DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from './DisplayArticle';
import ReviewCard, { ReviewCardSkeleton } from './ReviewCard';
import ReviewForm from './ReviewForm';

interface ArticleContentViewProps {
  articleSlug: string;
  articleId?: number;
  communityId?: number | null;
  communityArticleId?: number | null;
  communityName?: string | null;
  isAdmin?: boolean;
  showPdfViewerButton?: boolean;
  handleOpenPdfViewer?: () => void;
  onReviewFormToggle?: (show: boolean) => void;
  submitReviewExternal?: boolean;
  defaultTab?: 'reviews' | 'discussions';
  tabResetKey?: string | number;
}

/**
 * Shared component for displaying article content with reviews and discussions tabs.
 * Used by both ArticleDisplayPageClient and DiscussionsPageClient to avoid duplication.
 *
 * @param articleSlug - The article slug for fetching article data
 * @param articleId - Optional article ID (used when available to avoid waiting for fetch)
 * @param communityId - Optional community ID for discussions
 * @param communityArticleId - Optional community article ID for discussions
 * @param isAdmin - Optional admin flag for discussions
 * @param showPdfViewerButton - Whether to show the PDF viewer button
 * @param handleOpenPdfViewer - Handler for opening PDF viewer
 * @param onReviewFormToggle - Callback when review form is toggled (for parent state management)
 * @param submitReviewExternal - External control for showing review form
 * @param defaultTab - Optional default tab selection ("reviews" or "discussions")
 * @param tabResetKey - Optional key to reset tab state when the parent selection changes
 */
const ArticleContentView: React.FC<ArticleContentViewProps> = ({
  articleSlug,
  articleId: externalArticleId,
  communityId,
  communityArticleId,
  communityName,
  isAdmin,
  showPdfViewerButton = false,
  handleOpenPdfViewer,
  onReviewFormToggle,
  submitReviewExternal,
  defaultTab = 'reviews',
  tabResetKey,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [submitReviewInternal, setSubmitReviewInternal] = useState(false);

  // Fetch full article data
  const isQueryEnabled = !!articleSlug && !!accessToken;

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Sidebar shows 403 error for community articles while article page works
     Root cause: Community articles require community_name parameter, sidebar wasn't sending it
     Solution: Pass community_name when available (for community articles)
     Result: Sidebar now works for both regular and community articles */
  const {
    data: articleData,
    error: articleError,
    isPending: articleIsPending,
  } = useArticlesApiGetArticle(
    articleSlug,
    communityName ? { community_name: communityName } : {},
    {
      request: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
      query: {
        enabled: isQueryEnabled,
        staleTime: TEN_MINUTES_IN_MS,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      },
    }
  );

  // Use external articleId if provided, otherwise use fetched data
  const articleId = externalArticleId || articleData?.data?.id;

  // Fetch reviews for the article
  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesReviewApiListReviews(
    articleId || 0,
    {},
    {
      query: {
        enabled: !!articleId && !!accessToken,
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  // Show errors
  useEffect(() => {
    if (articleError) showErrorToast(articleError);
  }, [articleError]);

  useEffect(() => {
    if (reviewsError) showErrorToast(reviewsError);
  }, [reviewsError]);

  // Check if user has reviewed
  const hasUserReviewed = reviewsData?.data.items.some((review) => review.is_author) || false;

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Resolve community identifiers from fetched article data when parent lacks them.
     Why: Articles tab previews may not include community metadata, hiding the subscribe button.
     How: Fall back to articleData.community_article values and pass them into discussions. */
  const resolvedCommunityArticleId =
    communityArticleId ?? articleData?.data?.community_article?.id ?? null;
  const resolvedCommunityId =
    communityId ?? articleData?.data?.community_article?.community?.id ?? null;
  const isReviewFormControlled = typeof submitReviewExternal === 'boolean';
  const isReviewFormOpen = isReviewFormControlled ? !!submitReviewExternal : submitReviewInternal;

  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Added an internal review-form fallback for right-panel article previews.
     Why: Preview contexts do not always provide parent-controlled review toggle state, so Add review did nothing.
     How: Track local review-form state when external control is absent and unify toggle handling. */
  const handleReviewFormToggle = () => {
    const nextState = !isReviewFormOpen;
    if (isReviewFormControlled && onReviewFormToggle) {
      onReviewFormToggle(nextState);
      return;
    }
    setSubmitReviewInternal(nextState);
  };

  useEffect(() => {
    // Reset local form-open state when switching articles to avoid stale UI carryover.
    setSubmitReviewInternal(false);
  }, [articleSlug]);

  const shouldShowSubscribeButton = !!resolvedCommunityArticleId && !!resolvedCommunityId;
  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Support a default tab override for article content views.
     Why: Discussions page should open with the Discussions tab selected by default.
     How: Convert the defaultTab name into a stable tab index for TabNavigation. */
  const initialTabIndex = defaultTab === 'discussions' ? 1 : 0;

  // Create tabs configuration
  const tabs = articleData
    ? [
        {
          title: 'Reviews',
          content: () => (
            <div className="flex flex-col">
              {!hasUserReviewed && (
                <div className="flex items-center justify-between rounded-md bg-functional-green/5 px-4 py-2">
                  <span className="text-sm font-semibold text-text-secondary">
                    Have your reviews? (You can add a review only once.)
                  </span>
                  {/* Fixed by Codex on 2026-02-15
                      Who: Codex
                      What: Use a button for the review toggle with aria state.
                      Why: Span-based click targets are not keyboard accessible.
                      How: Switch to button with aria-expanded and focus-visible ring. */}
                  <button
                    type="button"
                    className="text-xs text-functional-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-blue"
                    onClick={handleReviewFormToggle}
                    aria-expanded={isReviewFormOpen}
                  >
                    {isReviewFormOpen ? 'Cancel' : 'Add review'}
                  </button>
                </div>
              )}
              {isReviewFormOpen && !hasUserReviewed && (
                <div id="article-content-view-review-form">
                  <ReviewForm
                    articleId={Number(articleId)}
                    refetch={reviewsRefetch}
                    communityId={resolvedCommunityId}
                    is_submitter={articleData.data.is_submitter}
                    onSubmitSuccess={() => {
                      if (isReviewFormControlled && onReviewFormToggle) {
                        onReviewFormToggle(false);
                        return;
                      }
                      setSubmitReviewInternal(false);
                    }}
                  />
                </div>
              )}
              <span className="mb-4 border-b border-common-minimal pb-2 text-base font-bold text-text-secondary">
                Reviews
              </span>
              {reviewsIsPending && [...Array(5)].map((_, i) => <ReviewCardSkeleton key={i} />)}
              {reviewsData?.data.items.length === 0 && (
                <EmptyState
                  content="No reviews yet"
                  subcontent="Be the first to review this article"
                />
              )}
              {reviewsData?.data.items.map((item) => (
                <ReviewCard key={item.id} review={item} refetch={reviewsRefetch} />
              ))}
            </div>
          ),
        },
        {
          title: 'Discussions',
          content: () =>
            articleData.data.id ? (
              <DiscussionForum
                articleId={Number(articleData.data.id)}
                communityId={resolvedCommunityId}
                communityArticleId={resolvedCommunityArticleId}
                showSubscribeButton={shouldShowSubscribeButton}
                isAdmin={isAdmin}
              />
            ) : null,
        },
      ]
    : [];

  if (articleIsPending) {
    return <DisplayArticleSkeleton />;
  }

  if (!articleData) {
    return <EmptyState content="Article not found" subcontent="The article could not be loaded" />;
  }

  return (
    <>
      <DisplayArticle
        article={articleData.data}
        showPdfViewerButton={showPdfViewerButton}
        handleOpenPdfViewer={handleOpenPdfViewer}
      />
      <div className="mt-4">
        <TabNavigation tabs={tabs} initialActiveTab={initialTabIndex} resetKey={tabResetKey} />
      </div>
    </>
  );
};

export default ArticleContentView;
