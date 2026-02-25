'use client';

import React, { useEffect, useMemo } from 'react';

import Link from 'next/link';

import { Check, CheckCheck, MessageSquare, SquareArrowOutUpRight } from 'lucide-react';

import { useUsersApiGetNotifications, useUsersApiMarkNotificationAsRead } from '@/api/users/users';
import { BlockSkeleton, Skeleton } from '@/components/common/Skeleton';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import TabNavigation from '@/components/ui/tab-navigation';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import { getSafeNavigableUrl } from '@/lib/safeUrl';
import { useAuthStore } from '@/stores/authStore';
import {
  MentionNotificationItem,
  useMentionNotificationsStore,
} from '@/stores/mentionNotificationsStore';

const formatMentionTimestamp = (timestamp: string): string => {
  const parsedTimestamp = Date.parse(timestamp);
  if (Number.isNaN(parsedTimestamp)) return 'Unknown time';
  return new Date(parsedTimestamp).toLocaleString();
};

const sortMentionsByDetectedTime = (mentions: MentionNotificationItem[]): MentionNotificationItem[] =>
  [...mentions].sort((firstMention, secondMention) => secondMention.detectedAt - firstMention.detectedAt);

interface MentionsTabProps {
  unreadMentions: MentionNotificationItem[];
  readMentions: MentionNotificationItem[];
  onMentionClick: (mentionId: string) => void;
}

const MentionsTab: React.FC<MentionsTabProps> = ({ unreadMentions, readMentions, onMentionClick }) => {
  if (unreadMentions.length === 0 && readMentions.length === 0) {
    return (
      <div className="rounded-xl border border-common-minimal bg-common-background p-6 text-center">
        <p className="text-sm font-medium text-text-secondary">No mentions detected yet.</p>
        <p className="mt-1 text-xs text-text-tertiary">
          When someone uses `@yourname` in discussions, it will appear here.
        </p>
      </div>
    );
  }

  const renderMentionRow = (mention: MentionNotificationItem, isRead: boolean) => {
    const mentionLabel = mention.sourceType === 'comment' ? 'Comment mention' : 'Discussion mention';

    return (
      <li
        key={mention.id}
        className={`rounded-xl border p-4 ${
          isRead
            ? 'border-common-minimal bg-common-background'
            : 'border-common-contrast bg-common-cardBackground'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text-primary">{mentionLabel}</p>
          <p className="text-xs text-text-tertiary">{formatMentionTimestamp(mention.createdAt)}</p>
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          Mentioned by <span className="font-semibold">@{mention.authorUsername}</span>
        </p>
        <p className="mt-2 text-sm text-text-secondary">{mention.excerpt}</p>
        <div className="mt-3">
          <Link
            href={mention.link}
            onClick={() => onMentionClick(mention.id)}
            className="inline-flex items-center gap-1 text-sm text-functional-green hover:text-functional-greenContrast"
          >
            View discussion
            <SquareArrowOutUpRight size={12} className="inline" />
          </Link>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare size={16} className="text-functional-green" />
          <h2 className="text-sm font-semibold text-text-primary">
            Unread Mentions ({unreadMentions.length})
          </h2>
        </div>
        {unreadMentions.length === 0 ? (
          <div className="rounded-xl border border-common-minimal bg-common-background p-4 text-xs text-text-tertiary">
            No unread mentions.
          </div>
        ) : (
          <ul className="space-y-3">{unreadMentions.map((mention) => renderMentionRow(mention, false))}</ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Read Mentions</h2>
        {readMentions.length === 0 ? (
          <div className="rounded-xl border border-common-minimal bg-common-background p-4 text-xs text-text-tertiary">
            No read mentions yet.
          </div>
        ) : (
          <ul className="space-y-3">{readMentions.map((mention) => renderMentionRow(mention, true))}</ul>
        )}
      </section>
    </div>
  );
};

interface SystemNotificationsTabProps {
  isPending: boolean;
  notifications: Array<{
    id: number;
    message: string;
    isRead: boolean;
    notificationType: string;
    createdAt: string;
    content: string | null;
    link: string | null;
  }>;
  onMarkAsRead: (id: number) => void;
}

const SystemNotificationsTab: React.FC<SystemNotificationsTabProps> = ({
  isPending,
  notifications,
  onMarkAsRead,
}) => {
  if (isPending) {
    return <NotificationCardSkeletonLoader />;
  }

  if (notifications.length === 0) {
    return <p className="text-center text-text-tertiary">No notifications to show.</p>;
  }

  return (
    <ul className="flex w-full flex-col items-center gap-4">
      {notifications.map((notification) => {
        /* Fixed by Codex on 2026-02-25
           Who: Codex
           What: Resolve notification targets as internal or external before rendering the View link.
           Why: Relative links were opening as dead external URLs instead of routing inside the app.
           How: Use shared safe URL parsing and render Next `Link` for internal routes, anchor tags for off-site links. */
        const safeLink = getSafeNavigableUrl(notification.link);

        return (
          <li
            key={notification.id}
            className={`w-full rounded-xl border p-4 ${
              notification.isRead
                ? 'border-common-minimal bg-common-background'
                : 'border-common-contrast bg-common-cardBackground'
            }`}
          >
            <p
              className={`text-base font-medium ${
                notification.isRead ? 'text-text-secondary' : 'text-text-primary'
              }`}
            >
              {notification.message}
            </p>
            <p className="text-sm text-text-tertiary">
              {notification.notificationType} - {new Date(notification.createdAt).toLocaleDateString()}
            </p>
            {notification.content && (
              <p className="mt-2 text-sm text-text-secondary">{notification.content}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              {safeLink &&
                (safeLink.isExternal ? (
                  <a
                    href={safeLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-functional-green hover:text-functional-greenContrast"
                  >
                    View
                    <SquareArrowOutUpRight size={12} className="inline" />
                  </a>
                ) : (
                  <Link
                    href={safeLink.href}
                    className="flex items-center gap-1 text-sm text-functional-green hover:text-functional-greenContrast"
                  >
                    View
                    <SquareArrowOutUpRight size={12} className="inline" />
                  </Link>
                ))}
              {!notification.isRead ? (
                <Button onClick={() => onMarkAsRead(notification.id)} className="px-3 py-1.5">
                  <ButtonIcon>
                    <Check size={14} />
                  </ButtonIcon>
                  <ButtonTitle className="sm:text-xs">Mark as Read</ButtonTitle>
                </Button>
              ) : (
                <Button
                  className="px-3 py-1.5 text-text-tertiary hover:bg-transparent"
                  variant={'outline'}
                >
                  <ButtonIcon>
                    <CheckCheck size={14} />
                  </ButtonIcon>
                  <ButtonTitle className="sm:text-xs">Read</ButtonTitle>
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const NotificationPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const authHeaders = useAuthHeaders();

  const ownerUserId = useMentionNotificationsStore((state) => state.ownerUserId);
  const mentions = useMentionNotificationsStore((state) => state.mentions);
  const setOwnerIfNeeded = useMentionNotificationsStore((state) => state.setOwnerIfNeeded);
  const cleanupExpired = useMentionNotificationsStore((state) => state.cleanupExpired);
  const markMentionAsRead = useMentionNotificationsStore((state) => state.markMentionAsRead);

  const { data, isPending, refetch } = useUsersApiGetNotifications(
    {},
    {
      request: authHeaders,
      query: {
        enabled: isAuthenticated,
      },
    }
  );

  const { mutate, isSuccess } = useUsersApiMarkNotificationAsRead({
    request: authHeaders,
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Scope persisted mention notifications to the active user and prune stale entries.
     Why: Mention history should survive sessions for one user but never leak into another account.
     How: Align the mention store owner with the authenticated user id and apply 30-day cleanup on page load. */
  useEffect(() => {
    if (!user?.id) return;
    setOwnerIfNeeded(user.id);
    cleanupExpired(user.id);
  }, [cleanupExpired, setOwnerIfNeeded, user?.id]);

  const mentionItems = useMemo(() => {
    if (!user?.id) return [];
    if (ownerUserId !== user.id) return [];
    return sortMentionsByDetectedTime(mentions);
  }, [mentions, ownerUserId, user?.id]);

  const unreadMentions = useMemo(
    () => mentionItems.filter((mention) => !mention.isRead),
    [mentionItems]
  );
  const readMentions = useMemo(() => mentionItems.filter((mention) => mention.isRead), [mentionItems]);

  const markAsRead = (id: number) => {
    mutate({ notificationId: id });
  };

  const handleMentionClick = (mentionId: string) => {
    if (!user?.id) return;
    markMentionAsRead(user.id, mentionId);
  };

  const notifications = data?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-center text-4xl font-bold text-text-primary sm:my-6">
        Notifications
      </h1>
      <TabNavigation
        tabs={[
          {
            title: 'System',
            content: () => (
              <SystemNotificationsTab
                isPending={isPending}
                notifications={notifications}
                onMarkAsRead={markAsRead}
              />
            ),
          },
          {
            title: unreadMentions.length > 0 ? `Mentions (${unreadMentions.length})` : 'Mentions',
            content: () => (
              <MentionsTab
                unreadMentions={unreadMentions}
                readMentions={readMentions}
                onMentionClick={handleMentionClick}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default NotificationPage;

const NotificationCardSkeletonLoader: React.FC = () => {
  return (
    <Skeleton className="w-full gap-4">
      <BlockSkeleton className="h-28 rounded-xl" />
      <BlockSkeleton className="h-28 rounded-xl" />
      <BlockSkeleton className="h-28 rounded-xl" />
    </Skeleton>
  );
};
