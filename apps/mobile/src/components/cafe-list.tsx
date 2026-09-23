import { FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Cafe } from '@bean-stalker/contracts';

import { Colors, Spacing } from '@/constants/theme';
import CafeCard from './cafe-card';

export default function CafeList({ cafes }: { cafes: Cafe[] }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <FlatList
      data={cafes}
      keyExtractor={(cafe) => cafe.placeId}
      style={styles.list}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={CafeSeparator}
      ListHeaderComponent={
        <View style={styles.heading}>
          <Text style={[styles.headingTitle, { color: colors.text }]}>Nearby cafés</Text>
          <Text style={[styles.headingMeta, { color: colors.textSecondary }]}>
            {cafes.length} {cafes.length === 1 ? 'place' : 'places'} found
          </Text>
        </View>
      }
      renderItem={({ item }) => <CafeCard cafe={item} />}
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
