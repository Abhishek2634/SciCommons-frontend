/**
 * Generated by orval v6.29.1 🍺
 * Do not edit manually.
 * MyApp API
 * OpenAPI spec version: 1.0.0
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import type { AdminArticlesResponse, MembersResponse, Message } from '.././schemas';

/**
 * @summary Get Articles By Status
 */
export const communitiesApiAdminGetArticlesByStatus = (
  communityName: string,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<AdminArticlesResponse>> => {
  return axios.get(
    `https://scicommons-backend-revamp.onrender.com/api/communities/${communityName}/admin-articles`,
    options
  );
};

export const getCommunitiesApiAdminGetArticlesByStatusQueryKey = (communityName: string) => {
  return [
    `https://scicommons-backend-revamp.onrender.com/api/communities/${communityName}/admin-articles`,
  ] as const;
};

export const getCommunitiesApiAdminGetArticlesByStatusQueryOptions = <
  TData = Awaited<ReturnType<typeof communitiesApiAdminGetArticlesByStatus>>,
  TError = AxiosError<Message>,
>(
  communityName: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof communitiesApiAdminGetArticlesByStatus>>,
        TError,
        TData
      >
    >;
    axios?: AxiosRequestConfig;
  }
) => {
  const { query: queryOptions, axios: axiosOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getCommunitiesApiAdminGetArticlesByStatusQueryKey(communityName);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof communitiesApiAdminGetArticlesByStatus>>
  > = ({ signal }) =>
    communitiesApiAdminGetArticlesByStatus(communityName, { signal, ...axiosOptions });

  return { queryKey, queryFn, enabled: !!communityName, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof communitiesApiAdminGetArticlesByStatus>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type CommunitiesApiAdminGetArticlesByStatusQueryResult = NonNullable<
  Awaited<ReturnType<typeof communitiesApiAdminGetArticlesByStatus>>
>;
export type CommunitiesApiAdminGetArticlesByStatusQueryError = AxiosError<Message>;

/**
 * @summary Get Articles By Status
 */
export const useCommunitiesApiAdminGetArticlesByStatus = <
  TData = Awaited<ReturnType<typeof communitiesApiAdminGetArticlesByStatus>>,
  TError = AxiosError<Message>,
>(
  communityName: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof communitiesApiAdminGetArticlesByStatus>>,
        TError,
        TData
      >
    >;
    axios?: AxiosRequestConfig;
  }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getCommunitiesApiAdminGetArticlesByStatusQueryOptions(
    communityName,
    options
  );

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * @summary Manage an article
 */
export const communitiesApiAdminManageArticle = (
  communityId: number,
  articleId: number,
  action: 'approve' | 'publish' | 'reject' | 'unpublish' | 'remove',
  options?: AxiosRequestConfig
): Promise<AxiosResponse<Message>> => {
  return axios.post(
    `https://scicommons-backend-revamp.onrender.com/api/communities/${communityId}/manage-article/${articleId}/${action}`,
    undefined,
    options
  );
};

export const getCommunitiesApiAdminManageArticleMutationOptions = <
  TError = AxiosError<Message>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof communitiesApiAdminManageArticle>>,
    TError,
    {
      communityId: number;
      articleId: number;
      action: 'approve' | 'publish' | 'reject' | 'unpublish' | 'remove';
    },
    TContext
  >;
  axios?: AxiosRequestConfig;
}): UseMutationOptions<
  Awaited<ReturnType<typeof communitiesApiAdminManageArticle>>,
  TError,
  {
    communityId: number;
    articleId: number;
    action: 'approve' | 'publish' | 'reject' | 'unpublish' | 'remove';
  },
  TContext
> => {
  const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof communitiesApiAdminManageArticle>>,
    {
      communityId: number;
      articleId: number;
      action: 'approve' | 'publish' | 'reject' | 'unpublish' | 'remove';
    }
  > = (props) => {
    const { communityId, articleId, action } = props ?? {};

    return communitiesApiAdminManageArticle(communityId, articleId, action, axiosOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type CommunitiesApiAdminManageArticleMutationResult = NonNullable<
  Awaited<ReturnType<typeof communitiesApiAdminManageArticle>>
>;

export type CommunitiesApiAdminManageArticleMutationError = AxiosError<Message>;

/**
 * @summary Manage an article
 */
export const useCommunitiesApiAdminManageArticle = <
  TError = AxiosError<Message>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof communitiesApiAdminManageArticle>>,
    TError,
    {
      communityId: number;
      articleId: number;
      action: 'approve' | 'publish' | 'reject' | 'unpublish' | 'remove';
    },
    TContext
  >;
  axios?: AxiosRequestConfig;
}): UseMutationResult<
  Awaited<ReturnType<typeof communitiesApiAdminManageArticle>>,
  TError,
  {
    communityId: number;
    articleId: number;
    action: 'approve' | 'publish' | 'reject' | 'unpublish' | 'remove';
  },
  TContext
> => {
  const mutationOptions = getCommunitiesApiAdminManageArticleMutationOptions(options);

  return useMutation(mutationOptions);
};
/**
 * @summary Get Community Members
 */
export const communitiesApiAdminGetCommunityMembers = (
  communityName: string,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<MembersResponse>> => {
  return axios.get(
    `https://scicommons-backend-revamp.onrender.com/api/communities/${communityName}/members`,
    options
  );
};

export const getCommunitiesApiAdminGetCommunityMembersQueryKey = (communityName: string) => {
  return [
    `https://scicommons-backend-revamp.onrender.com/api/communities/${communityName}/members`,
  ] as const;
};

export const getCommunitiesApiAdminGetCommunityMembersQueryOptions = <
  TData = Awaited<ReturnType<typeof communitiesApiAdminGetCommunityMembers>>,
  TError = AxiosError<Message>,
>(
  communityName: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof communitiesApiAdminGetCommunityMembers>>,
        TError,
        TData
      >
    >;
    axios?: AxiosRequestConfig;
  }
) => {
  const { query: queryOptions, axios: axiosOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getCommunitiesApiAdminGetCommunityMembersQueryKey(communityName);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof communitiesApiAdminGetCommunityMembers>>
  > = ({ signal }) =>
    communitiesApiAdminGetCommunityMembers(communityName, { signal, ...axiosOptions });

  return { queryKey, queryFn, enabled: !!communityName, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof communitiesApiAdminGetCommunityMembers>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type CommunitiesApiAdminGetCommunityMembersQueryResult = NonNullable<
  Awaited<ReturnType<typeof communitiesApiAdminGetCommunityMembers>>
>;
export type CommunitiesApiAdminGetCommunityMembersQueryError = AxiosError<Message>;

/**
 * @summary Get Community Members
 */
export const useCommunitiesApiAdminGetCommunityMembers = <
  TData = Awaited<ReturnType<typeof communitiesApiAdminGetCommunityMembers>>,
  TError = AxiosError<Message>,
>(
  communityName: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof communitiesApiAdminGetCommunityMembers>>,
        TError,
        TData
      >
    >;
    axios?: AxiosRequestConfig;
  }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getCommunitiesApiAdminGetCommunityMembersQueryOptions(
    communityName,
    options
  );

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * @summary Manage Community Member
 */
export const communitiesApiAdminManageCommunityMember = (
  communityId: number,
  userId: number,
  action:
    | 'promote_admin'
    | 'promote_moderator'
    | 'promote_reviewer'
    | 'demote_admin'
    | 'demote_moderator'
    | 'demote_reviewer'
    | 'remove',
  options?: AxiosRequestConfig
): Promise<AxiosResponse<Message>> => {
  return axios.post(
    `https://scicommons-backend-revamp.onrender.com/api/communities/${communityId}/manage-member/${userId}/${action}`,
    undefined,
    options
  );
};

export const getCommunitiesApiAdminManageCommunityMemberMutationOptions = <
  TError = AxiosError<Message>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof communitiesApiAdminManageCommunityMember>>,
    TError,
    {
      communityId: number;
      userId: number;
      action:
        | 'promote_admin'
        | 'promote_moderator'
        | 'promote_reviewer'
        | 'demote_admin'
        | 'demote_moderator'
        | 'demote_reviewer'
        | 'remove';
    },
    TContext
  >;
  axios?: AxiosRequestConfig;
}): UseMutationOptions<
  Awaited<ReturnType<typeof communitiesApiAdminManageCommunityMember>>,
  TError,
  {
    communityId: number;
    userId: number;
    action:
      | 'promote_admin'
      | 'promote_moderator'
      | 'promote_reviewer'
      | 'demote_admin'
      | 'demote_moderator'
      | 'demote_reviewer'
      | 'remove';
  },
  TContext
> => {
  const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof communitiesApiAdminManageCommunityMember>>,
    {
      communityId: number;
      userId: number;
      action:
        | 'promote_admin'
        | 'promote_moderator'
        | 'promote_reviewer'
        | 'demote_admin'
        | 'demote_moderator'
        | 'demote_reviewer'
        | 'remove';
    }
  > = (props) => {
    const { communityId, userId, action } = props ?? {};

    return communitiesApiAdminManageCommunityMember(communityId, userId, action, axiosOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type CommunitiesApiAdminManageCommunityMemberMutationResult = NonNullable<
  Awaited<ReturnType<typeof communitiesApiAdminManageCommunityMember>>
>;

export type CommunitiesApiAdminManageCommunityMemberMutationError = AxiosError<Message>;

/**
 * @summary Manage Community Member
 */
export const useCommunitiesApiAdminManageCommunityMember = <
  TError = AxiosError<Message>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof communitiesApiAdminManageCommunityMember>>,
    TError,
    {
      communityId: number;
      userId: number;
      action:
        | 'promote_admin'
        | 'promote_moderator'
        | 'promote_reviewer'
        | 'demote_admin'
        | 'demote_moderator'
        | 'demote_reviewer'
        | 'remove';
    },
    TContext
  >;
  axios?: AxiosRequestConfig;
}): UseMutationResult<
  Awaited<ReturnType<typeof communitiesApiAdminManageCommunityMember>>,
  TError,
  {
    communityId: number;
    userId: number;
    action:
      | 'promote_admin'
      | 'promote_moderator'
      | 'promote_reviewer'
      | 'demote_admin'
      | 'demote_moderator'
      | 'demote_reviewer'
      | 'remove';
  },
  TContext
> => {
  const mutationOptions = getCommunitiesApiAdminManageCommunityMemberMutationOptions(options);

  return useMutation(mutationOptions);
};
