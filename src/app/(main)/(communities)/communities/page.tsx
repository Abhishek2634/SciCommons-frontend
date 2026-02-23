'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useQueries } from '@tanstack/react-query';
import { Users } from 'lucide-react';

import { useCommunitiesApiListCommunities } from '@/api/communities/communities';
import { CommunityListOut } from '@/api/schemas';
import { useUsersApiListMyCommunities, usersApiListMyCommunities } from '@/api/users/users';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import CommunityCard, {
  CommunityCardSkeleton,
  CommunityRoleBadge,
} from '@/components/communities/CommunityCard';
import TabComponent from '@/components/communities/TabComponent';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import { useFilteredList } from '@/hooks/useFilteredList';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface CommunitiesResponse {
  data: {
    items: CommunityListOut[];
    num_pages: number;
    total: number;
  };
}

enum CommunityFilters {
  ALL = 'all',
  BOOKMARKED = 'bookmarked',
}

enum Tabs {
  COMMUNITIES = 'Communities',
  MY_COMMUNITIES = 'My Communities',
}

type ElevatedRole = 'admin' | 'moderator' | 'reviewer';

const roleBadgeDefinitions: Array<{ role: ElevatedRole; badge: CommunityRoleBadge }> = [
  { role: 'admin', badge: { code: 'A', label: 'Admin' } },
  { role: 'moderator', badge: { code: 'M', label: 'Moderator' } },
  { role: 'reviewer', badge: { code: 'R', label: 'Reviewer' } },
];

const ROLE_QUERY_PAGE_SIZE = 50;

interface TabContentProps {
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  accessToken?: string;
  isActive: boolean;
  headerTabs?: React.ReactNode;
}

const CommunitiesTabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  accessToken,
  isActive,
  headerTabs,
}) => {
  const { displayedItems, setItems, appendItems, setFilter, activeFilter, reset } =
    useFilteredList<CommunityListOut>({
      filters: {
        [CommunityFilters.ALL]: () => true,
        [CommunityFilters.BOOKMARKED]: (community) => community.is_bookmarked === true,
      },
      defaultFilter: CommunityFilters.ALL,
    });

  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.PAGINATION;

  const requestConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

  const { data, isPending, error } = useCommunitiesApiListCommunities<CommunitiesResponse>(
    {
      page,
      per_page: 50,
      search,
    },
    {
      query: {
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['communities', page, search, accessToken ? 'authenticated' : 'public'],
        enabled: isActive,
      },
      request: requestConfig,
    }
  );

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1 || loadingType === LoadingType.PAGINATION) {
        setItems(data.data.items);
      } else {
        appendItems(data.data.items);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, error, page, loadingType, setItems, appendItems]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      reset();
    },
    [setSearch, setPage, reset]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderCommunity = useCallback(
    (community: CommunityListOut) => <CommunityCard community={community} />,
    []
  );

  const renderSkeleton = useCallback(() => <CommunityCardSkeleton />, []);

  return (
    <div
      className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'hidden opacity-0'}`}
    >
      <SearchableList<CommunityListOut>
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        renderItem={renderCommunity}
        renderSkeleton={renderSkeleton}
        isLoading={isPending}
        items={displayedItems}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        loadingType={loadingType}
        searchPlaceholder="Search communities..."
        emptyStateContent="No communities found"
        emptyStateSubcontent="Try using different keywords"
        emptyStateLogo={<Users size={64} />}
        title={Tabs.COMMUNITIES}
        headerTabs={headerTabs}
        listContainerClassName="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"
        filters={[
          { label: 'All', value: CommunityFilters.ALL },
          { label: 'Bookmarked', value: CommunityFilters.BOOKMARKED },
        ]}
        activeFilter={activeFilter}
        onSelectFilter={(filter) => {
          setFilter(filter);
        }}
      />
    </div>
  );
};

const MyCommunitiesTabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  accessToken,
  isActive,
  headerTabs,
}) => {
  const { displayedItems, setItems, appendItems, setFilter, activeFilter, reset } =
    useFilteredList<CommunityListOut>({
      filters: {
        [CommunityFilters.ALL]: () => true,
        [CommunityFilters.BOOKMARKED]: (community) => community.is_bookmarked === true,
      },
      defaultFilter: CommunityFilters.ALL,
    });

  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.PAGINATION;
  const myCommunitiesRequestConfig = accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : undefined;

  const { data, isPending, error } = useUsersApiListMyCommunities<CommunitiesResponse>(
    {
      page,
      per_page: 50,
      search,
    },
    {
      query: {
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['my_communities', page, search],
        enabled: isActive,
      },
      request: myCommunitiesRequestConfig,
    }
  );

  /* Fixed by Codex on 2026-02-23
     Who: Codex
     What: Added paginated role map queries (admin/moderator/reviewer) for My Communities cards.
     Why: A single filtered page can miss role matches, leading to incomplete badge marking.
     How: For each role, iterate through all `/my-communities?role=...` pages and build ID sets. */
  const roleQueries = useQueries({
    queries: roleBadgeDefinitions.map(({ role }) => ({
      queryKey: ['my_communities_roles', role, search],
      enabled: isActive && !!accessToken,
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryFn: async () => {
        if (!accessToken) return [] as number[];

        const roleCommunityIds: number[] = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const response = await usersApiListMyCommunities(
            {
              role,
              search,
              page: currentPage,
              per_page: ROLE_QUERY_PAGE_SIZE,
            },
            myCommunitiesRequestConfig
          );

          roleCommunityIds.push(...response.data.items.map((community) => community.id));
          totalPages = response.data.num_pages;
          currentPage += 1;
        } while (currentPage <= totalPages);

        return roleCommunityIds;
      },
    })),
  });

  const [adminRoleQuery, moderatorRoleQuery, reviewerRoleQuery] = roleQueries;

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1 || loadingType === LoadingType.PAGINATION) {
        setItems(data.data.items);
      } else {
        appendItems(data.data.items);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, error, page, loadingType, setItems, appendItems]);

  useEffect(() => {
    if (adminRoleQuery.error) {
      showErrorToast(adminRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
    if (moderatorRoleQuery.error) {
      showErrorToast(moderatorRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
    if (reviewerRoleQuery.error) {
      showErrorToast(reviewerRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
  }, [adminRoleQuery.error, moderatorRoleQuery.error, reviewerRoleQuery.error]);

  const adminCommunityIds = useMemo(() => new Set(adminRoleQuery.data ?? []), [adminRoleQuery.data]);
  const moderatorCommunityIds = useMemo(
    () => new Set(moderatorRoleQuery.data ?? []),
    [moderatorRoleQuery.data]
  );
  const reviewerCommunityIds = useMemo(
    () => new Set(reviewerRoleQuery.data ?? []),
    [reviewerRoleQuery.data]
  );

  const roleMembershipByRole = useMemo(
    () => ({
      admin: adminCommunityIds,
      moderator: moderatorCommunityIds,
      reviewer: reviewerCommunityIds,
    }),
    [adminCommunityIds, moderatorCommunityIds, reviewerCommunityIds]
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      reset();
    },
    [setSearch, setPage, reset]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderCommunity = useCallback(
    (community: CommunityListOut) => {
      const roleBadges = roleBadgeDefinitions
        .filter(({ role }) => roleMembershipByRole[role].has(community.id))
        .map(({ badge }) => badge);

      return <CommunityCard community={community} roleBadges={roleBadges} />;
    },
    [roleMembershipByRole]
  );

  const renderSkeleton = useCallback(() => <CommunityCardSkeleton />, []);

  return (
    <div
      className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'hidden opacity-0'}`}
    >
      <SearchableList<CommunityListOut>
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        renderItem={renderCommunity}
        renderSkeleton={renderSkeleton}
        isLoading={isPending}
        items={displayedItems}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        loadingType={loadingType}
        searchPlaceholder="Search your communities..."
        emptyStateContent="No communities found"
        emptyStateSubcontent="Try using different keywords"
        emptyStateLogo={<Users size={64} />}
        title={Tabs.MY_COMMUNITIES}
        headerTabs={headerTabs}
        listContainerClassName="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"
        filters={[
          { label: 'All', value: CommunityFilters.ALL },
          { label: 'Bookmarked', value: CommunityFilters.BOOKMARKED },
        ]}
        activeFilter={activeFilter}
        onSelectFilter={(filter) => {
          setFilter(filter);
        }}
      />
    </div>
  );
};

interface CommunitiesTabsProps {
  activeTab: Tabs;
  onTabChange: React.Dispatch<React.SetStateAction<Tabs>>;
}

const CommunitiesTabs: React.FC<CommunitiesTabsProps> = ({ activeTab, onTabChange }) => {
  const user = useAuthStore((state) => state.user);
  const tabsList = user ? [Tabs.COMMUNITIES, Tabs.MY_COMMUNITIES] : [Tabs.COMMUNITIES];
  return <TabComponent tabs={tabsList} activeTab={activeTab} setActiveTab={onTabChange} />;
};

const Communities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.COMMUNITIES);
  const [communitiesPage, setCommunitiesPage] = useState<number>(1);
  const [myCommunitiesPage, setMyCommunitiesPage] = useState<number>(1);
  const [communitiesSearch, setCommunitiesSearch] = useState<string>('');
  const [myCommunitiesSearch, setMyCommunitiesSearch] = useState<string>('');

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto p-4">
      <div className="relative">
        <CommunitiesTabContent
          search={communitiesSearch}
          setSearch={setCommunitiesSearch}
          page={communitiesPage}
          setPage={setCommunitiesPage}
          isActive={activeTab === Tabs.COMMUNITIES}
          headerTabs={<CommunitiesTabs activeTab={activeTab} onTabChange={setActiveTab} />}
          accessToken={accessToken ?? undefined}
        />
        {user && accessToken && (
          <>
            <MyCommunitiesTabContent
              search={myCommunitiesSearch}
              setSearch={setMyCommunitiesSearch}
              page={myCommunitiesPage}
              setPage={setMyCommunitiesPage}
              accessToken={accessToken}
              isActive={activeTab === Tabs.MY_COMMUNITIES}
              headerTabs={<CommunitiesTabs activeTab={activeTab} onTabChange={setActiveTab} />}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Communities;
