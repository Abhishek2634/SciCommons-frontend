'use client';

import TabNavigation from '@/components/ui/tab-navigation';
import DiscussionComments from '../DiscussionComments';
import { Sparkles, StickyNote, MessageSquare } from 'lucide-react';

const ViewerSidebarRight: React.FC<{ article: any }> = ({ article }) => {
  const tabs = [
    {
      title: (
        <div className="flex items-center gap-2">
          <Sparkles size={14} /> Assistant
        </div>
      ),
      content: () => (
        <div className="flex flex-col h-full p-4">
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="rounded-lg bg-functional-blue/10 p-3 text-xs text-text-primary">
              Hi! I'm your SciCommons AI. Highlight any text to ask questions about this paper.
            </div>
          </div>
          <div className="mt-auto pt-4">
            <input 
              placeholder="Ask anything about this paper..."
              className="w-full rounded-xl border border-common-minimal bg-common-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-functional-blue"
            />
          </div>
        </div>
      )
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <StickyNote size={14} /> My Notes
        </div>
      ),
      content: () => (
        <div className="p-4">
          <textarea 
            placeholder="Start taking notes..."
            className="h-64 w-full bg-transparent text-sm resize-none focus:outline-none"
          />
        </div>
      )
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <MessageSquare size={14} /> Comments
        </div>
      ),
      content: () => (
        <div className="p-4 h-full overflow-y-auto">
          <DiscussionComments 
             discussionId={article.discussion_id} 
             articleContext={{ communityId: article.community_id, articleId: article.id }}
          />
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col bg-common-cardBackground border-l border-common-minimal">
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default ViewerSidebarRight;