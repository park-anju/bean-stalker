import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';

import { expoLocationAdapter } from './expoLocationAdapter';
import { createLocationCoordinator, LocationCoordinator, LocationState } from './locationState';
import { LocationAdapter } from './locationTypes';

type LocationContextValue = {
  state: LocationState;
  retry: () => Promise<void>;
  openAppSettings: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

type LocationProviderProps = PropsWithChildren<{
  adapter?: LocationAdapter;
}>;

export function LocationProvider({
  adapter = expoLocationAdapter,
  children,
}: LocationProviderProps) {
  const coordinatorRef = useRef<LocationCoordinator | null>(null);
  if (!coordinatorRef.current) {
    coordinatorRef.current = createLocationCoordinator(adapter);
  }

  const coordinator = coordinatorRef.current;
  const [state, setState] = useState<LocationState>(() => coordinator.getState());

  const retry = useCallback(async () => {
    setState({ status: 'resolving', location: coordinator.getState().location });
    setState(await coordinator.resolve());
  }, [coordinator]);

  useEffect(() => {
    if (state.status === 'idle') {
      void retry();
    }
  }, [retry, state.status]);

  const revalidateServices = useCallback(async () => {
    setState(await coordinator.revalidateServices());
  }, [coordinator]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void revalidateServices();
      }
    };
    const handleFocus = () => {
      void revalidateServices();
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    const focusSubscription = AppState.addEventListener('focus', handleFocus);

    return () => {
      appStateSubscription.remove();
      focusSubscription.remove();
    };
  }, [revalidateServices]);

  const openAppSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  return (
    <LocationContext.Provider value={{ state, retry, openAppSettings }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const value = useContext(LocationContext);
  if (!value) {
    throw new Error('useLocation must be used inside LocationProvider');
  }

  return value;
}
