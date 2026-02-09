import React, { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesApiUpdateArticle } from '@/api/articles/articles';
import { ArticleUpdateSchema } from '@/api/schemas';
import FormInput from '@/components/common/FormInput';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import { Button, ButtonTitle } from '@/components/ui/button';
import { Option } from '@/components/ui/multiple-selector';
import { ARTICLE_TITLE_MIN_LENGTH } from '@/constants/common.constants';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { FileObj } from '@/types';

interface FormValues {
  title: string;
  abstract: string;
  authors: Option[];
  // keywords: Option[];
  submissionType: 'Public' | 'Private';
  articleImageFile: FileObj;
}

interface EditArticleDetailsProps {
  articleId: number;
  title: string;
  abstract: string;
  authors: Option[];
  // keywords: Option[];
  submissionType: 'Public' | 'Private';
  defaultImageURL: string | null;
  articleSlug: string;
}

const EditArticleDetails: React.FC<EditArticleDetailsProps> = (props) => {
  const {
    title,
    abstract,
    authors,
    submissionType,
    defaultImageURL: _defaultImageURL,
    articleId,
    articleSlug,
  } = props;
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: title,
      abstract: abstract,
      authors: authors,
      // keywords: keywords,
      submissionType: submissionType,
    },
  });

  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const {
    mutate,
    error: updateError,
    isPending: isUpdatePending,
    isSuccess,
  } = useArticlesApiUpdateArticle({ request: axiosConfig });

  const router = useRouter();
  const queryClient = useQueryClient();

  const onSubmit = (formData: FormValues) => {
    const dataToSend: ArticleUpdateSchema = {
      payload: {
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors.map((author) => ({
          value: author.value,
          label: author.label,
        })),
        // keywords: formData.keywords.map((keyword) => keyword.value),
        submission_type: formData.submissionType,
      },
    };
    // let image_file: File | undefined;
    // if (formData.articleImageFile && formData.articleImageFile.file) {
    //   const originalFile = formData.articleImageFile.file;
    //   let fileName = originalFile.name;

    //   // Truncate filename if it's longer than 100 characters
    //   if (fileName.length > 100) {
    //     const extension = fileName.split('.').pop() || '';
    //     fileName = fileName.slice(0, 96 - extension.length) + '...' + extension;
    //   }

    //   image_file = new File([originalFile], fileName, { type: originalFile.type });
    // }

    // mutate({ articleId, data: { details: dataToSend, image_file } });
    mutate({ articleId, data: { details: dataToSend } });
  };

  useEffect(() => {
    if (isSuccess) {
      /* Fixed by Codex on 2026-02-09
         Problem: Edited articles could remain stale in list views and detail view until a manual refresh.
         Solution: Invalidate articles/my-articles list queries AND the specific article query on successful update.
         Result: Both lists and article detail page refetch and show edits immediately.
         Alternatives (not implemented): (1) Optimistically update cached list items,
         (2) Force a refetch when returning to the list pages. */
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['my_articles'] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/article/${articleSlug}`] });
      toast.success('Article details updated successfully');
      router.push(`/article/${articleSlug}`);
    }
    if (updateError) {
      toast.error(`${updateError.response?.data.message}`);
    }
  }, [updateError, isSuccess, router, articleSlug, queryClient]);

  return (
    /* Fixed by Codex on 2026-02-09
       Problem: Edit screen required an extra toggle and showed community-focused helper text.
       Solution: Keep fields editable by default and update labels/messages for articles.
       Result: Users can edit immediately with accurate guidance. */
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
      {/* <Controller
        name="articleImageFile"
        control={control}
        render={({}) => (
          <ImageUpload
            control={control}
            name="articleImageFile"
            label="Article Image"
            info="Upload a profile image for your community"
            defaultImageURL={defaultImageURL || undefined}
          />
        )}
      /> */}
      <FormInput<FormValues>
        label="Title"
        name="title"
        type="text"
        placeholder="Enter the title of your article"
        register={register}
        requiredMessage="Title is required"
        minLengthValue={ARTICLE_TITLE_MIN_LENGTH}
        minLengthMessage={`Title must be at least ${ARTICLE_TITLE_MIN_LENGTH} characters`}
        info="Please provide a clear and concise title for your article."
        errors={errors}
      />
      <FormInput<FormValues>
        label="Abstract"
        name="abstract"
        type="text"
        textArea={true}
        placeholder="Enter the abstract of your article"
        register={register}
        requiredMessage="Abstract is required"
        minLengthValue={10}
        minLengthMessage="Abstract must be at least 10 characters"
        info="Provide a brief summary of your article's content."
        errors={errors}
      />
      <Controller
        name="authors"
        control={control}
        rules={{ required: 'Authors are required' }}
        render={({ field: { onChange, value }, fieldState }) => (
          <MultiLabelSelector
            label="Authors"
            tooltipText="Select authors for the article."
            placeholder="Add Authors"
            creatable
            value={value}
            onChange={onChange}
            fieldState={fieldState}
          />
        )}
      />
      {/* <Controller
        name="keywords"
        control={control}
        rules={{ required: 'Authors are required' }}
        render={({ field: { onChange, value }, fieldState }) => (
          <MultiLabelSelector
            label="Keywords"
            tooltipText="Help users find your community by adding tags."
            placeholder="Add Tags"
            creatable
            value={value}
            onChange={onChange}
            fieldState={fieldState}
          />
        )}
      /> */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-text-secondary">Submission Type</label>
        <Controller
          name="submissionType"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="mt-1 flex gap-2">
              <Button
                className={cn(
                  'w-fit cursor-pointer rounded-lg border px-4 py-2',
                  value === 'Public'
                    ? 'border-functional-green bg-functional-green/10'
                    : 'border-common-contrast'
                )}
                type="button"
                variant={'outline'}
                onClick={() => onChange('Public')}
              >
                <ButtonTitle className="text-base">Public</ButtonTitle>
              </Button>
              {/* <Button
                className={cn(
                  'w-fit cursor-pointer rounded-lg border px-4 py-2',
                  value === 'Private'
                    ? 'border-functional-green bg-functional-green/10'
                    : 'border-common-contrast'
                )}
                type="button"
                variant={'outline'}
                onClick={() => isEditEnabled && onChange('Private')}
              >
                <ButtonTitle className="text-base">Private</ButtonTitle>
              </Button> */}
            </div>
          )}
        />
      </div>
      <Button
        showLoadingSpinner={false}
        loading={isUpdatePending}
        className="mx-auto w-full"
        type="submit"
      >
        <ButtonTitle>{isUpdatePending ? 'Loading...' : 'Update Article'}</ButtonTitle>
      </Button>
    </form>
  );
};

export default EditArticleDetails;

export const EditArticleDetailsSkeleton = () => {
  return (
    <Skeleton>
      <TextSkeleton className="w-32" />
      <TextSkeleton className="h-10" />
      <TextSkeleton className="mt-4 w-32" />
      <TextSkeleton className="h-10" />
      <TextSkeleton className="mt-4 w-32" />
      <BlockSkeleton />
      <TextSkeleton className="mt-4 w-32" />
      <BlockSkeleton className="h-72" />
      <TextSkeleton className="mt-4 w-32" />
      <TextSkeleton className="h-10" />
    </Skeleton>
  );
};
