'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import PreprintViewer from '@/components/articles/PreprintViewer';
import { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { buildSciCommonsTitle } from '@/lib/pageTitle';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const CommunityArticleDisplayPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ articleSlug: string; slug: string }>();

  // Fetch Article Data
  const { data, error, isPending } = useArticlesApiGetArticle(
    params?.articleSlug || '',
    { community_name: params?.slug || '' },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIFTEEN_MINUTES_IN_MS,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    }
  );

  /**
   * Browser Title Update
   * Follows the pattern: "<Article Title> | SciCommons"
   */
  useEffect(() => {
    if (data?.data?.title) {
      document.title = buildSciCommonsTitle(data.data.title, {
        fallbackSegment: 'Article',
        truncate: true,
      });
    }
  }, [data?.data?.title]);

  // Error Handling
  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-common-background">
        <DisplayArticleSkeleton />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex h-screen items-center justify-center text-text-tertiary bg-common-background">
        Article not found
      </div>
    );
  }

  /**
   * Main Layout:
   * We wrap the PreprintViewer in a container that occupies the full height 
   * minus the global navbar (64px) and prevents body scrolling.
   */
  return (
    <main className="h-[calc(100vh-64px)] w-full overflow-hidden bg-common-background">
      <PreprintViewer article={data.data} />
    </main>
  );
};

export default withAuthRedirect(CommunityArticleDisplayPage, { requireAuth: true });