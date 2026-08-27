import type { ErrorCode, SearchCenter } from '@bean-stalker/contracts';

export type LocationSource = 'current' | 'manual';

export type LocationErrorReason = Extract<
  ErrorCode,
  'LOCATION_PERMISSION_DENIED' | 'LOCATION_UNAVAILABLE' | 'VALIDATION_ERROR'
>;

export type LocationState =
  | { status: 'idle' }
  | { status: 'resolving'; source: LocationSource }
  | { status: 'resolved'; source: LocationSource; center: SearchCenter }
  | { status: 'error'; source: LocationSource; reason: LocationErrorReason; message: string };

export type LocationAction =
  | { type: 'REQUEST_CURRENT' }
  | { type: 'REQUEST_MANUAL' }
  | { type: 'RESOLVED'; source: LocationSource; center: SearchCenter }
  | { type: 'FAILED'; source: LocationSource; reason: LocationErrorReason; message: string }
  | { type: 'RESET' };

export const initialLocationState: LocationState = { status: 'idle' };

export function locationReducer(_state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'REQUEST_CURRENT':
      return { status: 'resolving', source: 'current' };
    case 'REQUEST_MANUAL':
      return { status: 'resolving', source: 'manual' };
    case 'RESOLVED':
      return { status: 'resolved', source: action.source, center: action.center };
    case 'FAILED':
      return {
        status: 'error',
        source: action.source,
        reason: action.reason,
        message: action.message,
      };
    case 'RESET':
      return { status: 'idle' };
  }
}
