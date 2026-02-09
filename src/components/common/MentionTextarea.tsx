import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  rows?: number;
  mentionableUsers: Array<{ id: number; username: string }>;
  hasError?: boolean;
}

interface MentionState {
  show: boolean;
  search: string;
  position: { top: number; left: number };
  startIndex: number;
}

const MentionTextarea: React.FC<MentionTextareaProps> = ({
  value,
  onChange,
  placeholder,
  className,
  rows = 3,
  mentionableUsers,
  hasError,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mentionState, setMentionState] = useState<MentionState>({
    show: false,
    search: '',
    position: { top: 0, left: 0 },
    startIndex: -1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter users based on search
  const filteredUsers = mentionableUsers.filter((user) =>
    user.username.toLowerCase().includes(mentionState.search.toLowerCase())
  );

  // Get caret position in pixels for dropdown placement
  const getCaretCoordinates = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { top: 0, left: 0 };

    // Create a mirror div to calculate caret position
    const mirror = document.createElement('div');
    const styles = window.getComputedStyle(textarea);

    // Copy styles
    Array.from(styles).forEach((prop) => {
      mirror.style.setProperty(prop, styles.getPropertyValue(prop));
    });

    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';

    document.body.appendChild(mirror);

    // Get text up to caret
    const text = textarea.value.substring(0, textarea.selectionStart);
    mirror.textContent = text;

    // Create caret element
    const caret = document.createElement('span');
    caret.textContent = '|';
    mirror.appendChild(caret);

    const textareaRect = textarea.getBoundingClientRect();
    const caretRect = caret.getBoundingClientRect();

    document.body.removeChild(mirror);

    return {
      top: caretRect.top - textareaRect.top + textarea.scrollTop + 20,
      left: caretRect.left - textareaRect.left + textarea.scrollLeft,
    };
  }, []);

  // Handle @ detection
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = newValue.substring(0, cursorPos);

      // Find last @ before cursor
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');

      if (lastAtIndex !== -1) {
        // Check if @ is at start or has whitespace before it
        const charBeforeAt = lastAtIndex === 0 ? ' ' : textBeforeCursor[lastAtIndex - 1];
        const isValidMentionStart = /\s/.test(charBeforeAt) || lastAtIndex === 0;

        if (isValidMentionStart) {
          const searchText = textBeforeCursor.substring(lastAtIndex + 1);

          // Check if search text doesn't contain spaces (valid mention search)
          if (!/\s/.test(searchText)) {
            const coords = getCaretCoordinates();
            setMentionState({
              show: true,
              search: searchText,
              position: coords,
              startIndex: lastAtIndex,
            });
            setSelectedIndex(0);
            return;
          }
        }
      }

      // Hide dropdown if no valid mention pattern
      setMentionState((prev) => ({ ...prev, show: false }));
    },
    [onChange, getCaretCoordinates]
  );

  // Insert mention
  const insertMention = useCallback(
    (username: string) => {
      if (!textareaRef.current) return;

      const beforeMention = value.substring(0, mentionState.startIndex);
      const afterMention = value.substring(textareaRef.current.selectionStart);
      const newValue = `${beforeMention}@${username} ${afterMention}`;

      onChange(newValue);
      setMentionState({ show: false, search: '', position: { top: 0, left: 0 }, startIndex: -1 });

      // Set cursor after the mention
      setTimeout(() => {
        const newCursorPos = mentionState.startIndex + username.length + 2; // +2 for @ and space
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current?.focus();
      }, 0);
    },
    [value, mentionState.startIndex, onChange]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!mentionState.show || filteredUsers.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
          break;
        case 'Enter':
        case 'Tab':
          if (mentionState.show) {
            e.preventDefault();
            insertMention(filteredUsers[selectedIndex].username);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setMentionState({
            show: false,
            search: '',
            position: { top: 0, left: 0 },
            startIndex: -1,
          });
          break;
      }
    },
    [mentionState.show, filteredUsers, selectedIndex, insertMention]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (mentionState.show && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, mentionState.show]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setMentionState({ show: false, search: '', position: { top: 0, left: 0 }, startIndex: -1 });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'block w-full rounded-md bg-common-background px-3 py-2 text-text-primary shadow-sm ring-1 ring-common-contrast res-text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-functional-green',
          {
            'ring-functional-red': hasError,
          },
          className
        )}
      />

      {/* Mention dropdown */}
      {mentionState.show && filteredUsers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 max-h-48 w-56 overflow-y-auto rounded-md border border-common-minimal bg-common-cardBackground shadow-lg"
          style={{
            top: `${mentionState.position.top}px`,
            left: `${mentionState.position.left}px`,
          }}
        >
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm transition-colors',
                index === selectedIndex
                  ? 'bg-functional-blue/10 text-functional-blue'
                  : 'text-text-primary hover:bg-common-minimal'
              )}
              onClick={() => insertMention(user.username)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              @{user.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionTextarea;
