import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { CafeSearchView } from '@/search/useCafeSearch';

import { Colors, Spacing } from '@/constants/theme';
import { describeSearchError } from '@/search/errorCopy';

export default function SearchStatus({
  view,
  onRetry,
}: {
  view: CafeSearchView;
  onRetry: () => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (view.status === 'loading') {
    return (
      <View style={styles.loading} accessibilityLiveRegion="polite" accessibilityRole="text">
        <ActivityIndicator color={colors.accent} />
        <Text style={[styles.supporting, { color: colors.textSecondary }]}>Finding cafés nearby…</Text>
      </View>
    );
  }

  if (view.status === 'error') {
    return (
      <View
        style={[styles.error, { backgroundColor: colors.warningSurface, borderColor: colors.border }]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <Text style={[styles.errorTitle, { color: colors.text }]}>We couldn’t load cafés</Text>
        <Text style={[styles.supporting, { color: colors.textSecondary }]}>
          {describeSearchError(view.error.code)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry café search"
          onPress={onRetry}
          style={[styles.retry, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.retryText}>Retry search</Text>
        </Pressable>
      </View>
    );
  }

  if (view.status === 'success' && view.cafes.length === 0) {
    return (
      <View style={styles.empty} accessibilityLiveRegion="polite" accessibilityRole="text">
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No cafés found nearby</Text>
        <Text style={[styles.supporting, { color: colors.textSecondary }]}>
          Try again later or check your location settings.
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  supporting: {
    fontSize: 16,
    lineHeight: 23,
  },
  error: {
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  retry: {
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  empty: {
    gap: Spacing.one,
    paddingVertical: Spacing.three,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
});
