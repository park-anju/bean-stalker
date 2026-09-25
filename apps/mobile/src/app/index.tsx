import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CafeList from '@/components/cafe-list';
import SearchStatus from '@/components/search-status';
import { Colors, Spacing } from '@/constants/theme';
import { useLocation } from '@/location/LocationProvider';
import CafeMap from '@/map/cafe-map';
import { reconcileSelectedCafeId, selectCafeId } from '@/map/mapSelection';
import { readySearchCenter } from '@/search/searchEligibility';
import { useCafeSearch } from '@/search/useCafeSearch';

export default function DiscoverScreen() {
  const { state, retry, openAppSettings } = useLocation();
  const center = readySearchCenter(state);
  const { view, retry: retrySearch } = useCafeSearch(center);
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const cafes = view.status === 'success' ? view.cafes : [];
  const activeSelectedCafeId = reconcileSelectedCafeId(cafes, selectedCafeId);
  const selectCafe = useCallback((cafeId: string) => {
    setSelectedCafeId(selectCafeId(cafeId));
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>KofVriend</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find a café for the moment.</Text>
        </View>

        <LocationStatus state={state} onRetry={retry} onOpenSettings={openAppSettings} />

        {state.status === 'ready' ? (
          view.status === 'success' && view.cafes.length > 0 && center ? (
            <CafeList
              cafes={view.cafes}
              selectedCafeId={activeSelectedCafeId}
              onSelectCafe={selectCafe}
              headerComponent={
                <CafeMap
                  center={center}
                  cafes={view.cafes}
                  selectedCafeId={activeSelectedCafeId}
                  onSelectCafe={selectCafe}
                />
              }
            />
          ) : (
            <SearchStatus view={view} onRetry={retrySearch} />
          )
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function LocationStatus({
  state,
  onRetry,
  onOpenSettings,
}: {
  state: ReturnType<typeof useLocation>['state'];
  onRetry: () => Promise<void>;
  onOpenSettings: () => Promise<void>;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (state.status === 'ready') {
    return (
      <View style={styles.readyStatus} accessibilityRole="text">
        <View style={[styles.readyDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.readyText, { color: colors.textSecondary }]}>Using your current location</Text>
      </View>
    );
  }

  if (state.status === 'permission-denied') {
    return <LocationError message="Location access is required to find cafés near you." actionLabel="Try again" onAction={onRetry} />;
  }

  if (state.status === 'settings-required') {
    return (
      <LocationError
        message="Location access is blocked. Enable it for KofVriend in Android settings."
        actionLabel="Open app settings"
        onAction={onOpenSettings}
        secondaryActionLabel="Try again"
        onSecondaryAction={onRetry}
      />
    );
  }

  if (state.status === 'services-unavailable') {
    return (
      <LocationError
        message="Device location services are unavailable. Enable Location in Android settings, then try again."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (state.status === 'services-disabled') {
    return (
      <LocationError
        message="Your last location is no longer verified. Turn on device Location, then try again."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (state.status === 'error') {
    return (
      <LocationError
        message="KofVriend could not determine your location."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  return (
    <Text style={[styles.resolving, { color: colors.textSecondary }]} accessibilityLiveRegion="polite">
      Finding your location…
    </Text>
  );
}

function LocationError({
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => Promise<void>;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => Promise<void>;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[styles.locationError, { backgroundColor: colors.warningSurface, borderColor: colors.border }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={[styles.locationMessage, { color: colors.text }]}>{message}</Text>
      <View style={styles.actions}>
        <TextButton label={actionLabel} onPress={onAction} />
        {secondaryActionLabel && onSecondaryAction ? (
          <TextButton label={secondaryActionLabel} onPress={onSecondaryAction} secondary />
        ) : null}
      </View>
    </View>
  );
}

function TextButton({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => Promise<void>;
  secondary?: boolean;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => void onPress()}
      style={[styles.button, { backgroundColor: secondary ? colors.backgroundElement : colors.accent }]}
    >
      <Text style={[styles.buttonText, { color: secondary ? colors.text : '#ffffff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    gap: Spacing.half,
    paddingBottom: Spacing.one,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  readyStatus: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  readyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resolving: {
    minHeight: 32,
    fontSize: 16,
    lineHeight: 23,
  },
  locationError: {
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },
  locationMessage: {
    fontSize: 16,
    lineHeight: 23,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
