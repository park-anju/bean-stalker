import {
  ForegroundPermission,
  LocationAdapter,
  SearchLocation,
  isValidSearchLocation,
} from './locationTypes';

export type LocationState =
  | { status: 'idle'; location: null }
  | { status: 'resolving'; location: SearchLocation | null }
  | { status: 'ready'; location: SearchLocation }
  | { status: 'services-disabled'; location: SearchLocation }
  | { status: 'permission-denied'; location: null }
  | { status: 'settings-required'; location: null }
  | { status: 'services-unavailable'; location: null }
  | { status: 'error'; location: null };

export type LocationCoordinator = {
  getState(): LocationState;
  resolve(): Promise<LocationState>;
  revalidateServices(): Promise<LocationState>;
};

function permissionState(permission: ForegroundPermission): LocationState | null {
  if (permission.status === 'granted') {
    return null;
  }

  if (permission.canAskAgain) {
    return { status: 'permission-denied', location: null };
  }

  return { status: 'settings-required', location: null };
}

async function resolveWithAdapter(adapter: LocationAdapter): Promise<LocationState> {
  let permission = await adapter.getForegroundPermission();

  if (permission.status !== 'granted') {
    if (!permission.canAskAgain) {
      return { status: 'settings-required', location: null };
    }

    permission = await adapter.requestForegroundPermission();
    const blockedState = permissionState(permission);
    if (blockedState) {
      return blockedState;
    }
  }

  if (!(await adapter.hasServicesEnabled())) {
    try {
      await adapter.requestServicesEnablement();
    } catch {
      return { status: 'services-unavailable', location: null };
    }

    if (!(await adapter.hasServicesEnabled())) {
      return { status: 'services-unavailable', location: null };
    }
  }

  const location = await adapter.getCurrentPosition();
  if (!isValidSearchLocation(location)) {
    return { status: 'error', location: null };
  }

  return { status: 'ready', location };
}

export function createLocationCoordinator(adapter: LocationAdapter): LocationCoordinator {
  let state: LocationState = { status: 'idle', location: null };
  let inFlight: Promise<LocationState> | null = null;
  let serviceRevalidationInFlight: Promise<LocationState> | null = null;

  function revalidateServices(): Promise<LocationState> {
    if (serviceRevalidationInFlight) {
      return serviceRevalidationInFlight;
    }

    if (state.status !== 'ready' && state.status !== 'services-disabled') {
      return Promise.resolve(state);
    }

    serviceRevalidationInFlight = adapter
      .hasServicesEnabled()
      .then((servicesEnabled) => {
        if (!servicesEnabled && state.status === 'ready') {
          state = { status: 'services-disabled', location: state.location };
        }

        return state;
      })
      .finally(() => {
        serviceRevalidationInFlight = null;
      });

    return serviceRevalidationInFlight;
  }

  return {
    getState() {
      return state;
    },

    resolve() {
      if (state.status === 'ready') {
        return Promise.resolve(state);
      }

      if (inFlight) {
        return inFlight;
      }

      state = { status: 'resolving', location: state.location };
      inFlight = resolveWithAdapter(adapter)
        .catch(() => ({ status: 'error', location: null }) satisfies LocationState)
        .then((nextState) => {
          state = nextState;
          return nextState;
        })
        .finally(() => {
          inFlight = null;
        });

      return inFlight;
    },

    revalidateServices,
  };
}
