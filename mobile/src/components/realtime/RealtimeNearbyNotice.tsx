import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { InlineNoticeRow } from '../InlineNoticeRow';

export function RealtimeNearbyNotice({
  title,
  groups,
  translate,
  onSelect,
}: {
  title: string;
  groups: string[];
  translate: (value: string) => string;
  onSelect: (value: string) => void;
}) {
  if (groups.length === 0) return null;

  return (
    <InlineNoticeRow variant="info">
      <Text style={styles.text}>
        {title}：
        {groups.map((group, index) => (
          <Text key={group} style={styles.link} onPress={() => onSelect(group)}>
            {`${translate(group)}${index !== groups.length - 1 ? ', ' : ''}`}
          </Text>
        ))}
      </Text>
    </InlineNoticeRow>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#333',
    lineHeight: 20,
  },
  link: {
    color: '#630a10',
  },
});
