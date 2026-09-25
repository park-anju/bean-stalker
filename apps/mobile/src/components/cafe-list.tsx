import { useEffect, useRef, type ReactElement } from 'react';
import { FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Cafe } from '@bean-stalker/contracts';

import { Colors, Spacing } from '@/constants/theme';
import { cafeIndexById } from '@/map/mapSelection';
import CafeCard from './cafe-card';

export default function CafeList({
  cafes,
  selectedCafeId,
  onSelectCafe,
  headerComponent,
}: {
  cafes: Cafe[];
  selectedCafeId: string | null;
  onSelectCafe: (cafeId: string) => void;
  headerComponent?: ReactElement;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const listRef = useRef<FlatList<Cafe> | null>(null);

  useEffect(() => {
    if (!selectedCafeId) return;
    const index = cafeIndexById(cafes, selectedCafeId);
    if (index < 0) return;

    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
  }, [cafes, selectedCafeId]);

  return (
    <FlatList
      ref={listRef}
      data={cafes}
      keyExtractor={(cafe) => cafe.placeId}
      style={styles.list}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={CafeSeparator}
      onScrollToIndexFailed={({ index }) => {
        listRef.current?.scrollToOffset({ offset: Math.max(0, index * 120), animated: true });
      }}
      ListHeaderComponent={
        <View>
          {headerComponent}
          <View style={styles.heading}>
            <Text style={[styles.headingTitle, { color: colors.text }]}>Nearby cafés</Text>
            <Text style={[styles.headingMeta, { color: colors.textSecondary }]}>
              {cafes.length} {cafes.length === 1 ? 'place' : 'places'} found
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <CafeCard
          cafe={item}
          selected={item.placeId === selectedCafeId}
          onPress={() => onSelectCafe(item.placeId)}
        />
      )}
    />
  );
}

function CafeSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },
  heading: {
    gap: Spacing.half,
    paddingBottom: Spacing.two,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  headingMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: Spacing.two,
  },
});
