'use client';

// InitializedMDXEditor.tsx
import type { ForwardedRef } from 'react';
import React from 'react';

import { useTheme } from 'next-themes';

import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  DirectiveDescriptor,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  StrikeThroughSupSubToggles,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

import { markdownStyles } from '@/constants/common.constants';
import { cn } from '@/lib/utils';

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  hideToolbar = false,
  mentionCandidates = [],
  ...props
}: {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  hideToolbar?: boolean;
  mentionCandidates?: string[];
} & MDXEditorProps) {
  const { theme } = useTheme();
  const editorRootRef = React.useRef<HTMLDivElement>(null);
  const editorMethodsRef = React.useRef<MDXEditorMethods | null>(null);
  const [activeMentionQuery, setActiveMentionQuery] = React.useState<string | null>(null);
  const [highlightedMentionIndex, setHighlightedMentionIndex] = React.useState(0);
  const [isMentionMenuOpen, setIsMentionMenuOpen] = React.useState(false);
  const [mentionMenuPlacement, setMentionMenuPlacement] = React.useState<'top' | 'bottom'>(
    'bottom'
  );
  const [mentionMenuMaxHeight, setMentionMenuMaxHeight] = React.useState(160);
  const mentionOptionRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const normalizedMentionCandidates = React.useMemo(() => {
    const dedupedNames = new Set<string>();
    mentionCandidates.forEach((candidate) => {
      const normalizedName = candidate.trim();
      if (normalizedName.length > 0) {
        dedupedNames.add(normalizedName);
      }
    });
    return Array.from(dedupedNames);
  }, [mentionCandidates]);

  const clearMentionMenu = React.useCallback(() => {
    setActiveMentionQuery(null);
    setIsMentionMenuOpen(false);
    setHighlightedMentionIndex(0);
  }, []);

  const updateMentionMenuPlacement = React.useCallback(() => {
    const editorRoot = editorRootRef.current;
    if (!editorRoot) return;

    const viewportMargin = 8;
    const preferredMenuHeight = 200;
    const rect = editorRoot.getBoundingClientRect();
    const spaceAbove = rect.top - viewportMargin;
    const spaceBelow = window.innerHeight - rect.bottom - viewportMargin;
    const shouldPlaceOnTop = spaceBelow < preferredMenuHeight && spaceAbove > spaceBelow;
    const availableSpace = shouldPlaceOnTop ? spaceAbove : spaceBelow;

    setMentionMenuPlacement(shouldPlaceOnTop ? 'top' : 'bottom');
    setMentionMenuMaxHeight(Math.max(80, Math.min(240, Math.floor(availableSpace))));
  }, []);

  const filteredMentionCandidates = React.useMemo(() => {
    if (!isMentionMenuOpen || activeMentionQuery === null) return [];
    const normalizedQuery = activeMentionQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return normalizedMentionCandidates.slice(0, 8);
    }

    return normalizedMentionCandidates
      .filter((candidate) => candidate.toLowerCase().startsWith(normalizedQuery))
      .slice(0, 8);
  }, [activeMentionQuery, isMentionMenuOpen, normalizedMentionCandidates]);

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Added mention autocomplete support to the MDX discussion editor.
     Why: New discussion content used markdown editor controls but lacked the `@member` suggestion flow available in comment textareas.
     How: Detect `@query` at the caret from the contenteditable selection, render a local candidate menu, and insert only the missing mention suffix via `insertMarkdown`. */
  const updateMentionContext = React.useCallback(() => {
    if (normalizedMentionCandidates.length === 0 || props.readOnly) {
      clearMentionMenu();
      return;
    }

    const editorRoot = editorRootRef.current;
    const contentEditable = editorRoot?.querySelector('[contenteditable="true"]') as
      | HTMLElement
      | null;

    if (!editorRoot || !contentEditable) {
      clearMentionMenu();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      clearMentionMenu();
      return;
    }

    const range = selection.getRangeAt(0);
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !contentEditable.contains(anchorNode)) {
      clearMentionMenu();
      return;
    }

    const textRange = range.cloneRange();
    textRange.selectNodeContents(contentEditable);
    textRange.setEnd(range.endContainer, range.endOffset);
    const textBeforeCaret = textRange.toString();

    const mentionMatch = textBeforeCaret.match(/(^|\s)@([A-Za-z0-9_.-]*)$/);
    if (!mentionMatch) {
      clearMentionMenu();
      return;
    }

    const nextMentionQuery = mentionMatch[2] ?? '';
    setActiveMentionQuery((previousMentionQuery) => {
      if (previousMentionQuery !== nextMentionQuery) {
        setHighlightedMentionIndex(0);
      }
      return nextMentionQuery;
    });
    updateMentionMenuPlacement();
    setIsMentionMenuOpen(true);
  }, [
    clearMentionMenu,
    normalizedMentionCandidates.length,
    props.readOnly,
    updateMentionMenuPlacement,
  ]);

  const handleSelectMention = React.useCallback(
    (memberName: string) => {
      const editorMethods = editorMethodsRef.current;
      if (!editorMethods) return;

      const mentionQuery = activeMentionQuery ?? '';
      const normalizedQuery = mentionQuery.toLowerCase();
      const normalizedMemberName = memberName.toLowerCase();
      const suffixToInsert =
        normalizedMemberName.startsWith(normalizedQuery) && mentionQuery.length <= memberName.length
          ? memberName.slice(mentionQuery.length)
          : memberName;

      editorMethods.insertMarkdown(`${suffixToInsert} `);
      clearMentionMenu();

      requestAnimationFrame(() => {
        editorMethods.focus();
      });
    },
    [activeMentionQuery, clearMentionMenu]
  );

  const handleEditorRef = React.useCallback(
    (methods: MDXEditorMethods | null) => {
      editorMethodsRef.current = methods;

      if (typeof editorRef === 'function') {
        editorRef(methods);
        return;
      }

      if (editorRef) {
        (editorRef as React.MutableRefObject<MDXEditorMethods | null>).current = methods;
      }
    },
    [editorRef]
  );

  React.useEffect(() => {
    if (filteredMentionCandidates.length === 0) {
      setIsMentionMenuOpen(false);
      return;
    }

    updateMentionMenuPlacement();
    if (highlightedMentionIndex >= filteredMentionCandidates.length) {
      setHighlightedMentionIndex(0);
    }
  }, [
    filteredMentionCandidates.length,
    highlightedMentionIndex,
    updateMentionMenuPlacement,
  ]);

  const handleEditorKeyDownCapture = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const editorRoot = editorRootRef.current;
      const contentEditable = editorRoot?.querySelector('[contenteditable="true"]') as
        | HTMLElement
        | null;
      if (!contentEditable || !contentEditable.contains(event.target as Node)) return;
      if (!isMentionMenuOpen || filteredMentionCandidates.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedMentionIndex(
          (previousIndex) => (previousIndex + 1) % filteredMentionCandidates.length
        );
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedMentionIndex(
          (previousIndex) =>
            (previousIndex - 1 + filteredMentionCandidates.length) %
            filteredMentionCandidates.length
        );
        return;
      }

      if ((event.key === 'Enter' || event.key === 'Tab') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleSelectMention(filteredMentionCandidates[highlightedMentionIndex]);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        clearMentionMenu();
      }
    },
    [
      clearMentionMenu,
      filteredMentionCandidates,
      handleSelectMention,
      highlightedMentionIndex,
      isMentionMenuOpen,
    ]
  );

  const handleEditorKeyUpCapture = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const editorRoot = editorRootRef.current;
      const contentEditable = editorRoot?.querySelector('[contenteditable="true"]') as
        | HTMLElement
        | null;
      if (!contentEditable || !contentEditable.contains(event.target as Node)) return;

      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === 'Tab' ||
        event.key === 'Escape'
      ) {
        return;
      }
      updateMentionContext();
    },
    [updateMentionContext]
  );

  const handleEditorClickCapture = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const editorRoot = editorRootRef.current;
      const contentEditable = editorRoot?.querySelector('[contenteditable="true"]') as
        | HTMLElement
        | null;
      if (!contentEditable || !contentEditable.contains(event.target as Node)) return;
      updateMentionContext();
    },
    [updateMentionContext]
  );

  React.useEffect(() => {
    if (!isMentionMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (editorRootRef.current?.contains(event.target as Node)) return;
      clearMentionMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearMentionMenu, isMentionMenuOpen]);

  React.useEffect(() => {
    if (!isMentionMenuOpen) return;

    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Kept markdown mention menu visible within viewport bounds.
       Why: Menus near the bottom of the page could render off-screen and hide suggestion options.
       How: Recompute menu placement/max-height on open and during resize/scroll, flipping above the editor when space is constrained. */
    const handleViewportChange = () => {
      updateMentionMenuPlacement();
    };

    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isMentionMenuOpen, updateMentionMenuPlacement]);

  React.useEffect(() => {
    if (!isMentionMenuOpen) return;

    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Auto-scrolled markdown mention options with keyboard navigation.
       Why: Arrowing through long lists could move highlight outside the visible suggestion window.
       How: Scroll active option into view using nearest alignment after highlight index updates. */
    mentionOptionRefs.current[highlightedMentionIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [highlightedMentionIndex, isMentionMenuOpen]);

  const YoutubeDirectiveDescriptor: DirectiveDescriptor = {
    name: 'youtube',
    type: 'leafDirective',
    testNode(node) {
      return node.name === 'youtube';
    },
    attributes: ['id'],
    hasChildren: false,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      const videoId =
        mdastNode.attributes && typeof mdastNode.attributes.id === 'string'
          ? mdastNode.attributes.id
          : '';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <button
            onClick={() => {
              parentEditor.update(() => {
                lexicalNode.selectNext();
                lexicalNode.remove();
              });
            }}
          >
            delete
          </button>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      );
    },
  };

  const CustomToolbar = () => {
    return (
      <DiffSourceToggleWrapper>
        <div className="mdx-editor-toolbar flex gap-1 overflow-x-auto p-1">
          <UndoRedo />
          <BlockTypeSelect />
          <BoldItalicUnderlineToggles />
          <StrikeThroughSupSubToggles />
          <CodeToggle />
          <InsertCodeBlock />
          <ListsToggle />
          <CreateLink />
          {/* <InsertImage /> */}
          <InsertTable />
          <InsertThematicBreak />
        </div>
      </DiffSourceToggleWrapper>
    );
  };

  const ALL_PLUGINS = [
    ...(hideToolbar ? [] : [toolbarPlugin({ toolbarContents: () => <CustomToolbar /> })]),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageUploadHandler: async () => Promise.resolve(''),
      disableImageSettingsButton: true,
      EditImageToolbar: () => {
        return null;
      },
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
    // sandpackPlugin({ sandpackConfig: virtuosoSampleSandpackConfig }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        js: 'JavaScript',
        css: 'CSS',
        txt: 'Plain Text',
        tsx: 'TypeScript',
        html: 'HTML',
        go: 'Go',
        java: 'Java',
        python: 'Python',
        bash: 'Bash',
        '': 'Unspecified',
      },
    }),
    directivesPlugin({
      directiveDescriptors: [YoutubeDirectiveDescriptor, AdmonitionDirectiveDescriptor],
    }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: props.markdown }),
    markdownShortcutPlugin(),
  ];

  return (
    <div
      className="relative"
      ref={editorRootRef}
      onKeyDownCapture={handleEditorKeyDownCapture}
      onKeyUpCapture={handleEditorKeyUpCapture}
      onClickCapture={handleEditorClickCapture}
    >
      <MDXEditor
        plugins={ALL_PLUGINS}
        {...props}
        ref={handleEditorRef}
        onChange={(markdown, initialMarkdownNormalize) => {
          props.onChange?.(markdown, initialMarkdownNormalize);
        }}
        placeholder={props.placeholder || 'Write here...'}
        className={cn('rounded-lg border border-common-contrast bg-common-background', theme, {
          'bg-common-cardBackground': props.readOnly,
        })}
        contentEditableClassName={markdownStyles}
      />
      {isMentionMenuOpen && filteredMentionCandidates.length > 0 && !props.readOnly && (
        <div
          className={cn(
            'absolute inset-x-0 z-20 rounded-md border border-common-contrast bg-common-cardBackground p-1 shadow-lg',
            mentionMenuPlacement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
          )}
        >
          <div className="mb-1 px-2 text-xxs text-text-tertiary">Mention a community member</div>
          <div className="overflow-y-auto" style={{ maxHeight: `${mentionMenuMaxHeight}px` }}>
            {filteredMentionCandidates.map((candidate, index) => (
              <button
                key={candidate}
                type="button"
                ref={(element) => {
                  mentionOptionRefs.current[index] = element;
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelectMention(candidate);
                }}
                className={cn(
                  'flex w-full items-center rounded px-2 py-1 text-left text-xs text-text-primary hover:bg-common-minimal',
                  index === highlightedMentionIndex && 'bg-common-minimal'
                )}
              >
                @{candidate}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
