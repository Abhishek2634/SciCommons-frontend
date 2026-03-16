'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useAuthStore } from '@/stores/authStore';
import PreprintViewer from '@/components/articles/PreprintViewer';
import { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';

const ArticlePage = () => {
  const params = useParams<{ slug: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, isPending } = useArticlesApiGetArticle(params.slug, {}, {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  if (isPending) return <DisplayArticleSkeleton />;
  if (!data?.data) return <div>Article not found</div>;

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-common-background">
      <PreprintViewer article={data.data} />
    </div>
  );
};

export default ArticlePage;