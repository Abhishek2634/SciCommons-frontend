import React from 'react';

import { cn } from '@/lib/utils';

import RenderParsedHTML from '../common/RenderParsedHTML';

/* Fixed by Codex on 2026-02-15
   Who: Codex
   What: Added AbstractText wrapper for consistent abstract rendering.
   Why: Preserve author line breaks without repeating RenderParsedHTML flags everywhere.
   How: Wrap RenderParsedHTML with fixed flags and whitespace-pre-line, allow class overrides. */
interface AbstractTextProps {
  text: string;
  className?: string;
  containerClassName?: string;
  isShrinked?: boolean;
  gradientClassName?: string;
}

const AbstractText: React.FC<AbstractTextProps> = ({
  text,
  className,
  containerClassName,
  isShrinked,
  gradientClassName,
}) => {
  return (
    <RenderParsedHTML
      rawContent={text}
      supportLatex={true}
      supportMarkdown={false}
      isShrinked={isShrinked}
      gradientClassName={gradientClassName}
      containerClassName={containerClassName}
      contentClassName={cn('whitespace-pre-line', className)}
    />
  );
};

export default AbstractText;
