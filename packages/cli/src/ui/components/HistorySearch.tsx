/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { type HistoryItem } from '../types.js';
import { Colors } from '../colors.js';

interface HistorySearchProps {
  history: HistoryItem[];
  onSelect: (text: string) => void;
  onExit: () => void;
}

export function HistorySearch({
  history,
  onSelect,
  onExit,
}: HistorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (searchTerm) {
      const userHistory = history.filter(
        (item) => item.type === 'user' && typeof item.text === 'string',
      );
      const results = userHistory.filter((item) =>
        (item.text as string).toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredHistory(results.reverse()); // Newest first
      setSelectedIndex(0);
    } else {
      setFilteredHistory([]);
    }
  }, [searchTerm, history]);

  const handleSelect = useCallback(() => {
    if (filteredHistory[selectedIndex]) {
      onSelect(filteredHistory[selectedIndex].text as string);
    }
  }, [filteredHistory, selectedIndex, onSelect]);

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

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1} marginY={1}>
      <Box>
        <Text>(reverse-i-search)`{searchTerm}`: </Text>
      </Box>
      <Box flexDirection="column" height={10}>
        {filteredHistory.map((item, index) => (
          <Text
            key={item.id}
            color={index === selectedIndex ? Colors.AccentBlue : undefined}
          >
            {index === selectedIndex ? '> ' : '  '}
            {item.text}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
