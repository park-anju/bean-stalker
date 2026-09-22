import { describe, expect, it } from 'vitest';

import { createLocationCoordinator } from './locationState';
import { LocationAdapter } from './locationTypes';

const readyLocation = { latitude: 3.139, longitude: 101.6869 };

function createAdapter(overrides: Partial<LocationAdapter> = {}): LocationAdapter {
  return {
    getForegroundPermission: async () => ({ status: 'granted', canAskAgain: true }),
    requestForegroundPermission: async () => ({ status: 'granted', canAskAgain: true }),
    hasServicesEnabled: async () => true,
    requestServicesEnablement: async () => undefined,
    getCurrentPosition: async () => readyLocation,
    ...overrides,
  };
}

describe('location coordinator', () => {
  it('resolves a granted permission into an in-memory location', async () => {
    const coordinator = createLocationCoordinator(createAdapter());

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'ready',
      location: readyLocation,
    });
  });

  it('stops after permission denial without acquiring a position', async () => {
    let acquisitionCalls = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        getForegroundPermission: async () => ({ status: 'undetermined', canAskAgain: true }),
        requestForegroundPermission: async () => ({ status: 'denied', canAskAgain: true }),
        getCurrentPosition: async () => {
          acquisitionCalls += 1;
          return readyLocation;
        },
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'permission-denied',
      location: null,
    });
    expect(acquisitionCalls).toBe(0);
  });

  it('reports settings-required when Android will not show the permission prompt again', async () => {
    let requestCalls = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        getForegroundPermission: async () => ({ status: 'denied', canAskAgain: false }),
        requestForegroundPermission: async () => {
          requestCalls += 1;
          return { status: 'denied', canAskAgain: false };
        },
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'settings-required',
      location: null,
    });
    expect(requestCalls).toBe(0);
  });

  it('does not request service enablement when device location services are enabled', async () => {
    let enablementCalls = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        requestServicesEnablement: async () => {
          enablementCalls += 1;
        },
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'ready',
      location: readyLocation,
    });
    expect(enablementCalls).toBe(0);
  });

  it('enables services and acquires location automatically after acceptance', async () => {
    let servicesEnabled = false;
    let enablementCalls = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => servicesEnabled,
        requestServicesEnablement: async () => {
          enablementCalls += 1;
          servicesEnabled = true;
        },
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'ready',
      location: readyLocation,
    });
    expect(enablementCalls).toBe(1);
  });

  it('verifies accepted enablement before acquiring the current position', async () => {
    let servicesEnabled = false;
    const events: string[] = [];
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => {
          events.push(`services:${servicesEnabled}`);
          return servicesEnabled;
        },
        requestServicesEnablement: async () => {
          events.push('enablement-request');
          servicesEnabled = true;
        },
        getCurrentPosition: async () => {
          events.push('acquire');
          return readyLocation;
        },
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'ready',
      location: readyLocation,
    });
    expect(events).toEqual([
      'services:false',
      'enablement-request',
      'services:true',
      'acquire',
    ]);
  });

  it('falls back to manual guidance when service enablement is declined', async () => {
    let enablementCalls = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => false,
        requestServicesEnablement: async () => {
          enablementCalls += 1;
          throw new Error('user declined');
        },
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'services-unavailable',
      location: null,
    });
    expect(enablementCalls).toBe(1);
    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'services-unavailable',
      location: null,
    });
    expect(enablementCalls).toBe(2);
  });

  it('retries service enablement after manual recovery', async () => {
    let servicesEnabled = false;
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => servicesEnabled,
        requestServicesEnablement: async () => {
          throw new Error('user declined');
        },
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'services-unavailable',
      location: null,
    });

    servicesEnabled = true;
    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'ready',
      location: readyLocation,
    });
  });

  it('reports unavailable device location services when enablement succeeds but services stay off', async () => {
    const coordinator = createLocationCoordinator(
      createAdapter({ hasServicesEnabled: async () => false }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'services-unavailable',
      location: null,
    });
  });

  it('rejects locations with invalid latitude or longitude', async () => {
    const coordinator = createLocationCoordinator(
      createAdapter({
        getCurrentPosition: async () => ({ latitude: 91, longitude: 101 }) as never,
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({ status: 'error', location: null });
  });

  it('bounds acquisition failures and permits an explicit retry', async () => {
    let attempts = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        getCurrentPosition: async () => {
          attempts += 1;
          if (attempts === 1) {
            throw new Error('provider unavailable');
          }
          return readyLocation;
        },
      }),
    );

    await expect(coordinator.resolve()).resolves.toEqual({ status: 'error', location: null });
    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'ready',
      location: readyLocation,
    });
  });

  it('reuses a ready location without requesting permission or position again', async () => {
    let permissionCalls = 0;
    let positionCalls = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        getForegroundPermission: async () => {
          permissionCalls += 1;
          return { status: 'granted', canAskAgain: true };
        },
        getCurrentPosition: async () => {
          positionCalls += 1;
          return readyLocation;
        },
      }),
    );

    await coordinator.resolve();
    await coordinator.resolve();

    expect(permissionCalls).toBe(1);
    expect(positionCalls).toBe(1);
  });

  it('preserves ready state when lifecycle revalidation finds services enabled', async () => {
    let positionCalls = 0;
    let serviceChecks = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => {
          serviceChecks += 1;
          return true;
        },
        getCurrentPosition: async () => {
          positionCalls += 1;
          return readyLocation;
        },
      }),
    );

    await coordinator.resolve();
    await coordinator.revalidateServices();

    expect(coordinator.getState()).toEqual({ status: 'ready', location: readyLocation });
    expect(serviceChecks).toBe(2);
    expect(positionCalls).toBe(1);
  });

  it('marks the snapshot services-disabled when lifecycle revalidation finds Location off', async () => {
    let servicesEnabled = true;
    let positionCalls = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => servicesEnabled,
        getCurrentPosition: async () => {
          positionCalls += 1;
          return readyLocation;
        },
      }),
    );

    await coordinator.resolve();
    servicesEnabled = false;
    await coordinator.revalidateServices();

    await expect(coordinator.revalidateServices()).resolves.toEqual({
      status: 'services-disabled',
      location: readyLocation,
    });
    expect(coordinator.getState()).toEqual({
      status: 'services-disabled',
      location: readyLocation,
    });
    expect(positionCalls).toBe(1);
  });

  it('does not reacquire on service recovery until explicit retry', async () => {
    let servicesEnabled = true;
    let positionCalls = 0;
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => servicesEnabled,
        getCurrentPosition: async () => {
          positionCalls += 1;
          return readyLocation;
        },
      }),
    );

    await coordinator.resolve();
    servicesEnabled = false;
    await coordinator.revalidateServices();
    servicesEnabled = true;
    await coordinator.revalidateServices();

    expect(coordinator.getState()).toEqual({
      status: 'services-disabled',
      location: readyLocation,
    });
    expect(positionCalls).toBe(1);

    await expect(coordinator.resolve()).resolves.toEqual({
      status: 'ready',
      location: readyLocation,
    });
    expect(positionCalls).toBe(2);
  });

  it('deduplicates concurrent lifecycle service checks', async () => {
    let serviceChecks = 0;
    let releaseCheck!: () => void;
    const serviceCheck = new Promise<boolean>((resolve) => {
      releaseCheck = () => resolve(true);
    });
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => {
          serviceChecks += 1;
          return serviceChecks === 1 ? true : serviceCheck;
        },
      }),
    );

    await coordinator.resolve();
    const first = coordinator.revalidateServices();
    const second = coordinator.revalidateServices();
    releaseCheck();

    await expect(Promise.all([first, second])).resolves.toEqual([
      { status: 'ready', location: readyLocation },
      { status: 'ready', location: readyLocation },
    ]);
    expect(serviceChecks).toBe(2);
  });

  it('deduplicates concurrent resolution requests', async () => {
    let positionCalls = 0;
    let releasePosition!: (location: typeof readyLocation) => void;
    const position = new Promise<typeof readyLocation>((resolve) => {
      releasePosition = resolve;
    });
    const coordinator = createLocationCoordinator(
      createAdapter({
        getCurrentPosition: async () => {
          positionCalls += 1;
          return position;
        },
      }),
    );

    const first = coordinator.resolve();
    const second = coordinator.resolve();
    releasePosition(readyLocation);

    await expect(Promise.all([first, second])).resolves.toEqual([
      { status: 'ready', location: readyLocation },
      { status: 'ready', location: readyLocation },
    ]);
    expect(positionCalls).toBe(1);
  });

  it('deduplicates concurrent service enablement requests', async () => {
    let enablementCalls = 0;
    let servicesEnabled = false;
    let releaseEnablement!: () => void;
    let markEnablementStarted!: () => void;
    const enablement = new Promise<void>((resolve) => {
      releaseEnablement = () => {
        servicesEnabled = true;
        resolve();
      };
    });
    const enablementStarted = new Promise<void>((resolve) => {
      markEnablementStarted = resolve;
    });
    const coordinator = createLocationCoordinator(
      createAdapter({
        hasServicesEnabled: async () => servicesEnabled,
        requestServicesEnablement: async () => {
          enablementCalls += 1;
          markEnablementStarted();
          await enablement;
        },
      }),
    );

    const first = coordinator.resolve();
    const second = coordinator.resolve();
    await enablementStarted;
    releaseEnablement();

    await expect(Promise.all([first, second])).resolves.toEqual([
      { status: 'ready', location: readyLocation },
      { status: 'ready', location: readyLocation },
    ]);
    expect(enablementCalls).toBe(1);
  });
});
