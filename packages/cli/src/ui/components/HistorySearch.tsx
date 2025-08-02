/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { type HistoryItem } from '../types.js';
import { Colors } from '../colors.js';

interface HistorySearchProps {
  history: HistoryItem[];
  onSelect: (text: string) => void;
  onExit: () => void;
}

const MAX_VISIBLE_ITEMS = 10;

export function HistorySearch({
  history,
  onSelect,
  onExit,
}: HistorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollIndex, setScrollIndex] = useState(0);

  const userHistory = useMemo(
    () =>
      history
        .filter((item) => item.type === 'user' && typeof item.text === 'string')
        .reverse(), // Newest first
    [history],
  );

  useEffect(() => {
    if (searchTerm) {
      const results = userHistory.filter((item) =>
        (item.text as string).toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredHistory(results);
      setSelectedIndex(0);
      setScrollIndex(0);
    } else {
      setFilteredHistory([]);
    }
  }, [searchTerm, userHistory]);

  const handleSelect = useCallback(() => {
    if (filteredHistory[selectedIndex]) {
      onSelect(filteredHistory[selectedIndex].text as string);
    }
  }, [filteredHistory, selectedIndex, onSelect]);

  useEffect(() => {
    if (selectedIndex < scrollIndex) {
      setScrollIndex(selectedIndex);
    } else if (selectedIndex >= scrollIndex + MAX_VISIBLE_ITEMS) {
      setScrollIndex(selectedIndex - MAX_VISIBLE_ITEMS + 1);
    }
  }, [selectedIndex, scrollIndex]);

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'r')) {
      onExit();
      return;
    }

    if (key.return) {
      handleSelect();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) =>
        Math.min(filteredHistory.length - 1, prev + 1),
      );
      return;
    }

    if (key.backspace || key.delete) {
      setSearchTerm((prev) => prev.slice(0, -1));
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      setSearchTerm((prev) => prev + input);
    }
  });

  const visibleItems = filteredHistory.slice(
    scrollIndex,
    scrollIndex + MAX_VISIBLE_ITEMS,
  );

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1} marginY={1}>
      <Box>
        <Text>(reverse-i-search)`{searchTerm}`: </Text>
      </Box>
      <Box flexDirection="column" height={MAX_VISIBLE_ITEMS}>
        {visibleItems.map((item) => {
          const isSelected = filteredHistory.indexOf(item) === selectedIndex;
          return (
            <Text
              key={item.id}
              color={isSelected ? Colors.AccentBlue : undefined}
            >
              {isSelected ? '> ' : '  '}
              {item.text}
            </Text>
          );
        })}
      </Box>
    </Box>
  );
}
