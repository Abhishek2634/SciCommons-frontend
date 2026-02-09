'use client';

import React, { useEffect } from 'react';

import { CircleXIcon } from 'lucide-react';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import EmptyState from '@/components/common/EmptyState';
import CommunityBreadcrumb from '@/components/communities/CommunityBreadcrumb';
import TabNavigation from '@/components/ui/tab-navigation';
import useStore from '@/hooks/useStore';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import AssessmentsList from './AssessmentsList';
import CommunityArticles from './CommunityArticles';
import CommunityRules from './CommunityRules';
import DisplayCommunity, { DisplayCommunitySkeleton } from './DisplayCommunity';

const Community = ({ params }: { params: { slug: string } }) => {
  const accessToken = useStore(useAuthStore, (state) => state.accessToken);
  const axiosConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

  const communityQuery = useCommunitiesApiGetCommunity(params.slug, {
    request: axiosConfig,
    query: {
      enabled: !!accessToken,
    },
  });

  const { data, error, isPending, refetch } = communityQuery;

  // Don't show error toast - we render error state instead
  // This prevents double error messages (toast + error page)
  useEffect(() => {
    // Only show toast for non-HTTP errors (network issues, etc.)
    if (error && !error.response?.status) {
      showErrorToast(error);
    }
  }, [error]);

  // Performance: Lazy-loaded tabs - Rules and Assessments only render when clicked
  const tabs = data
    ? [
        {
          title: 'Articles',
          content: () =>
            data.data.type == 'private' && !data.data.is_member ? (
              <EmptyState
                logo={<CircleXIcon className="size-8 text-text-secondary" />}
                content="Join to Access"
                subcontent="This is a private community. Become a member to view and contribute."
              />
            ) : (
              <CommunityArticles communityId={data.data.id} communityName={data.data.name} />
            ),
        },
        // {
        //   title: 'About',
        //   content: () => <CommunityAbout about={data.data.about as YooptaContentValue} />,
        // },
        ...(data.data.rules || data.data.is_member
          ? [
              {
                title: 'Rules',
                content: () => <CommunityRules community={data.data} />,
              },
            ]
          : []),
        ...(data.data.is_moderator || data.data.is_reviewer
          ? [
              {
                title: 'Assessments',
                content: () => <AssessmentsList communityId={data.data.id} />,
              },
            ]
          : []),
      ]
    : [];

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Accessing non-existent/private community caused logout and 404, horrible UX
     Solution: Add proper error state rendering for 404 and access denied cases
     Result: User sees meaningful error message without being logged out */

  // Handle error states without logging user out
  if (error && !isPending) {
    const is404 = error.response?.status === 404;
    const is403 = error.response?.status === 403;

    return (
      <div className="container h-fit p-4">
        <div className="pl-2">
          <CommunityBreadcrumb
            communityName={params.slug}
            communitySlug={params.slug}
            isLoading={false}
          />
        </div>
        <div className="flex min-h-[60vh] items-center justify-center">
          <EmptyState
            logo={<CircleXIcon className="size-16 text-text-tertiary" />}
            content={
              is404 ? 'Community Not Found' : is403 ? 'Access Denied' : 'Unable to Load Community'
            }
            subcontent={
              is404
                ? "This community doesn't exist or has been removed."
                : is403
                  ? "You don't have permission to view this private community."
                  : 'An error occurred while loading this community. Please try again later.'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container h-fit p-4">
      <div className="pl-2">
        <CommunityBreadcrumb
          communityName={data?.data.name}
          communitySlug={params.slug}
          isLoading={isPending}
        />
      </div>
      {isPending ? (
        <DisplayCommunitySkeleton />
      ) : (
        data && <DisplayCommunity community={data.data} refetch={refetch} />
      )}
      {data && (
        <div className="mt-2 md:mt-0">
          <TabNavigation tabs={tabs} />
        </div>
      )}
    </div>
  );
};

export default withAuthRedirect(Community, { requireAuth: true });
