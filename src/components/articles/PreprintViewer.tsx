'use client';

import React, { useState } from 'react';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';

import ViewerSidebarLeft from './viewer/ViewerSidebarLeft';
import ViewerSidebarRight from './viewer/ViewerSidebarRight';
import PDFRenderer from './viewer/PDFRenderer';

interface PreprintViewerProps {
  article: any; // Use ArticleOut type from your schemas
}

const PreprintViewer: React.FC<PreprintViewerProps> = ({ article }) => {
  const [activeTab, setActiveTab] = useState<'paper' | 'blog' | 'resources'>('paper');

  return (
    <div className="flex h-full w-full">
      {/* 1. Left Nav Sidebar (Collapsed by default or slim) */}
      <ViewerSidebarLeft />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 2. Top Navigation Bar */}
        <header className="flex h-12 items-center justify-between border-b border-common-minimal bg-common-cardBackground px-6">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('paper')}
              className={cn("flex items-center gap-2 text-sm font-medium transition-colors", 
                activeTab === 'paper' ? "text-functional-blue border-b-2 border-functional-blue h-12" : "text-text-tertiary")}
            >
              <FileText size={16} /> Paper
            </button>
            <button 
              onClick={() => setActiveTab('blog')}
              className={cn("flex items-center gap-2 text-sm font-medium transition-colors", 
                activeTab === 'blog' ? "text-functional-blue border-b-2 border-functional-blue h-12" : "text-text-tertiary")}
            >
              <ExternalLink size={16} /> Blog
            </button>
          </div>
          
          <div className="text-xs font-semibold text-text-secondary truncate max-w-md">
            {article.title}
          </div>
        </header>

        {/* 3. Main Content Area */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="h-full w-full bg-zinc-900">
               <PDFRenderer url={article.pdf_url || article.article_link} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-common-minimal" />

          <ResizablePanel defaultSize={35} minSize={25}>
            <ViewerSidebarRight article={article} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default PreprintViewer;