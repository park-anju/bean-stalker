import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocation } from '@/location/LocationProvider';

export default function DiscoverScreen() {
  const { state, retry, openAppSettings } = useLocation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Bean Stalker</Text>
        <Text style={styles.body}>Find cafés worth going to.</Text>
        <LocationStatus state={state} onRetry={retry} onOpenSettings={openAppSettings} />
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
  if (state.status === 'ready') {
    return (
      <View style={styles.statusCard} accessible accessibilityRole="text">
        <Text style={styles.statusTitle}>Location ready</Text>
        <Text style={styles.secondary}>Bean Stalker can now search nearby cafés.</Text>
      </View>
    );
  }

  if (state.status === 'permission-denied') {
    return (
      <LocationError
        message="Location access is required to find cafés near you."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (state.status === 'settings-required') {
    return (
      <LocationError
        message="Location access is blocked. Enable it for Bean Stalker in Android settings."
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
        message="Device location services are unavailable. Enable location in Android settings, then try again."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (state.status === 'services-disabled') {
    return (
      <LocationError
        message="Your last location is no longer verified. Turn on device Location if needed, then try again."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (state.status === 'error') {
    return (
      <LocationError
        message="Bean Stalker could not determine your location."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  return (
    <Text style={styles.secondary} accessibilityLiveRegion="polite">
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
  return (
    <View style={styles.errorCard} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Text style={styles.errorText}>{message}</Text>
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
  return (
    <Text
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => void onPress()}
      style={[styles.button, secondary && styles.secondaryButton]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: '#202124',
    fontSize: 32,
    fontWeight: '700',
  },
  body: {
    color: '#202124',
    fontSize: 20,
    lineHeight: 28,
  },
  secondary: {
    color: '#5f6368',
    fontSize: 16,
    lineHeight: 24,
  },
  statusCard: {
    gap: 8,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#eef6ee',
  },
  statusTitle: {
    color: '#1f5c2b',
    fontSize: 18,
    fontWeight: '700',
  },
  errorCard: {
    gap: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff4e5',
  },
  errorText: {
    color: '#5c3b00',
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#202124',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e8eaed',
    color: '#202124',
  },
});
