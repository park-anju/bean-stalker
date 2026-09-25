import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Cafe } from '@bean-stalker/contracts';

import { Colors, Spacing } from '@/constants/theme';
import {
  cafeCardAccessibilityLabel,
  cafeCardAccessibilityState,
  formatCafeDistance,
  formatCafeOpenStatus,
} from './cafe-presentation';

export default function CafeCard({
  cafe,
  selected = false,
  onPress,
}: {
  cafe: Cafe;
  selected?: boolean;
  onPress?: () => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const statusStyle =
    cafe.openStatus === 'OPEN'
      ? { color: colors.success }
      : cafe.openStatus === 'CLOSED'
        ? { color: colors.danger }
        : { color: colors.textSecondary };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessible
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={cafeCardAccessibilityLabel(cafe)}
      accessibilityState={cafeCardAccessibilityState(selected)}
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.surfaceMuted : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
        },
      ]}
    >
      <Text style={[styles.name, { color: colors.text }]}>{cafe.name}</Text>

      <View style={styles.summary}>
        {cafe.rating !== undefined ? (
          <Text style={[styles.summaryText, { color: colors.text }]}>★ {cafe.rating}</Text>
        ) : null}
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          {formatCafeDistance(cafe.distanceMeters)}
        </Text>
      </View>

      <Text style={[styles.status, statusStyle]}>{formatCafeOpenStatus(cafe.openStatus)}</Text>

      {cafe.formattedAddress ? (
        <Text style={[styles.address, { color: colors.textSecondary }]}>{cafe.formattedAddress}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },
  name: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.two,
    rowGap: Spacing.one,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  status: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  address: {
    fontSize: 16,
    lineHeight: 22,
  },
});
