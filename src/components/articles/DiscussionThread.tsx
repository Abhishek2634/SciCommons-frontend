import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreVertical,
  Share2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useArticlesDiscussionApiGetDiscussion,
  useArticlesDiscussionApiUpdateDiscussion,
} from '@/api/discussions/discussions';
import {
  useUsersCommonApiGetReactionCount,
  useUsersCommonApiPostReaction,
} from '@/api/users-common-api/users-common-api';
import { TEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import { useRealtimeContextStore } from '@/stores/realtimeStore';
import { Reaction } from '@/types';

import FormInput from '../common/FormInput';
import TruncateText from '../common/TruncateText';
import { Button, ButtonTitle } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import DiscussionComments from './DiscussionComments';

interface DiscussionThreadProps {
  discussionId: number;
  setDiscussionId: (discussionId: React.SetStateAction<number | null>) => void;
  refetchDiscussions?: () => void;
}

interface DiscussionEditFormValues {
  topic: string;
  content: string;
}

const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  discussionId,
  setDiscussionId,
  refetchDiscussions,
}) => {
  dayjs.extend(relativeTime);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isEditing, setIsEditing] = useState(false);

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Add discussion editing controls for authors.
     Why: Authors could edit comments but not their own discussion topics/content.
     How: Add an edit form with update mutation and reset it with discussion data. */
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiscussionEditFormValues>({
    defaultValues: {
      topic: '',
      content: '',
    },
  });

  useEffect(() => {
    const store = useRealtimeContextStore.getState();
    store.setActiveDiscussion(discussionId);
    // Mark that we're viewing a discussion thread (not the discussion list)
    store.setViewingDiscussions(false);

    return () => {
      store.setActiveDiscussion(null);
      // When leaving, we might go back to viewing discussions
      store.setViewingDiscussions(true);
    };
  }, [discussionId]);

  const { data, error, refetch } = useArticlesDiscussionApiGetDiscussion(discussionId, {
    query: { enabled: discussionId !== null && !!accessToken },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const { data: reactions, refetch: refetchReactions } = useUsersCommonApiGetReactionCount(
    'articles.discussion',
    Number(discussionId),
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: TEN_MINUTES_IN_MS,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    }
  );

  const { mutate } = useUsersCommonApiPostReaction({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetchReactions();
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const handleReaction = (reaction: Reaction) => {
    if (reaction === 'upvote')
      mutate({
        data: { content_type: 'articles.discussion', object_id: Number(discussionId), vote: 1 },
      });
    else if (reaction === 'downvote')
      mutate({
        data: { content_type: 'articles.discussion', object_id: Number(discussionId), vote: -1 },
      });
  };

  const discussion = data?.data;
  const canEditDiscussion = !!discussion?.is_author;

  useEffect(() => {
    if (discussion && !isEditing) {
      reset({ topic: discussion.topic, content: discussion.content });
    }
  }, [discussion, isEditing, reset]);

  const { mutate: updateDiscussion, isPending: isUpdating } =
    useArticlesDiscussionApiUpdateDiscussion({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: () => {
          toast.success('Discussion updated successfully.');
          setIsEditing(false);
          refetch();
          refetchDiscussions?.();
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  const handleEditStart = () => {
    if (discussion) {
      reset({ topic: discussion.topic, content: discussion.content });
      setIsEditing(true);
    }
  };

  const handleEditCancel = () => {
    if (discussion) {
      reset({ topic: discussion.topic, content: discussion.content });
    }
    setIsEditing(false);
  };

  const handleEditSubmit = (values: DiscussionEditFormValues) => {
    if (!discussion?.id) return;
    updateDiscussion({ discussionId: Number(discussion.id), data: values });
  };

  return (
    discussion && (
      <>
        {/* Fixed by Codex on 2026-02-15
            Who: Codex
            What: Tokenize discussion thread colors.
            Why: Keep thread styling aligned with UI skins.
            How: Replace gray/blue utilities with semantic tokens. */}
        <div className="text-text-primary res-text-sm">
          <button
            onClick={() => setDiscussionId(null)}
            className="mb-4 flex items-center text-text-secondary res-text-xs hover:text-functional-blue hover:underline"
          >
            <ArrowLeft className="mr-2" size={16} /> Back to Discussions
          </button>
          <div className="mb-4 rounded bg-common-cardBackground p-4 shadow">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={
                      discussion.user.profile_pic_url
                        ? discussion.user.profile_pic_url?.startsWith('http')
                          ? discussion.user.profile_pic_url
                          : `data:image/png;base64,${discussion.user.profile_pic_url}`
                        : `/images/assets/user-icon.webp`
                    }
                    alt={discussion.user.username}
                    width={32}
                    height={32}
                    className="mr-2 rounded-full object-cover"
                    quality={75}
                    sizes="32px"
                    unoptimized={!discussion.user.profile_pic_url}
                  />
                  <div>
                    <span>{discussion.user.username}</span>
                    <span className="ml-2 text-text-tertiary res-text-xs">
                      • {dayjs(discussion.created_at).fromNow()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {isEditing ? (
                    <form
                      onSubmit={handleSubmit(handleEditSubmit)}
                      className="mr-4 flex flex-col gap-3"
                    >
                      <FormInput<DiscussionEditFormValues>
                        label="Topic"
                        name="topic"
                        type="text"
                        placeholder="Enter discussion topic"
                        register={register}
                        requiredMessage="Topic is required"
                        errors={errors}
                        autoFocus
                      />
                      <FormInput<DiscussionEditFormValues>
                        label="Content"
                        name="content"
                        type="text"
                        placeholder="Enter discussion content"
                        register={register}
                        control={control}
                        requiredMessage="Content is required"
                        errors={errors}
                        textArea
                        supportMarkdown
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button type="submit" variant="blue" loading={isUpdating} showLoadingSpinner>
                          <ButtonTitle>{isUpdating ? 'Saving...' : 'Save changes'}</ButtonTitle>
                        </Button>
                        <Button type="button" variant="outline" onClick={handleEditCancel}>
                          <ButtonTitle>Cancel</ButtonTitle>
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="mr-4 flex-grow cursor-pointer font-bold res-text-base">
                        <TruncateText text={discussion.topic} maxLines={2} />
                      </div>
                      <div>
                        <TruncateText text={discussion.content} maxLines={3} />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 flex items-center text-text-tertiary res-text-xs">
                  <button type="button" className="mr-4 flex items-center space-x-1">
                    <MessageSquare size={16} />
                    <span>{discussion.comments_count} comments</span>
                  </button>
                  <button type="button" className="flex items-center space-x-1">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {canEditDiscussion && !isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="rounded-md p-1 text-text-tertiary hover:bg-common-minimal hover:text-text-primary focus:outline-none"
                        aria-label="Discussion actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEditStart}>
                        Edit discussion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <div className="flex flex-col items-center">
                  {/* Fixed by Codex on 2026-02-15
                    Who: Codex
                    What: Add labels and pressed state to discussion vote buttons.
                    Why: Icon-only controls are silent to screen readers and lack state.
                    How: Provide aria-label/pressed and explicit button types. */}
                  <button
                    type="button"
                    className="text-text-tertiary hover:text-text-secondary"
                    onClick={() => handleReaction('upvote')}
                    aria-label="Upvote discussion"
                    aria-pressed={reactions?.data.user_reaction === 1}
                  >
                    <ChevronUp size={20} />
                  </button>
                  <span className="font-bold text-text-secondary">{reactions?.data.likes}</span>
                  <button
                    type="button"
                    className="text-text-tertiary hover:text-text-secondary"
                    onClick={() => handleReaction('downvote')}
                    aria-label="Downvote discussion"
                    aria-pressed={reactions?.data.user_reaction === -1}
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <h3 className="mb-2 font-bold res-text-base">Comments</h3>
          <DiscussionComments discussionId={discussionId} />
        </div>
      </>
    )
  );
};

export default DiscussionThread;
