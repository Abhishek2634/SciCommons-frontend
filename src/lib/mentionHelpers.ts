/**
 * Wraps @username mentions in the content with styled spans
 * @param content - The raw comment content
 * @returns Content with styled mentions
 */
export const highlightMentions = (content: string): string => {
  // Match @username patterns (username can contain letters, numbers, underscores, hyphens)
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;

  return content.replace(
    mentionRegex,
    '<span class="mention-tag font-semibold text-functional-blue">@$1</span>'
  );
};

/**
 * Extracts all mentioned usernames from content
 * @param content - The comment content
 * @returns Array of mentioned usernames (without @)
 */
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};
