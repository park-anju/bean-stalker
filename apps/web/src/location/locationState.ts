import type { ErrorCode, SearchCenter } from '@bean-stalker/contracts';

export type LocationSource = 'current';

export type LocationErrorReason = Extract<
  ErrorCode,
  'LOCATION_PERMISSION_DENIED' | 'LOCATION_UNAVAILABLE'
>;

export type LocationFailureKind =
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'insecure-context'
  | 'unsupported'
  | 'unexpected';

export type LocationState =
  | { status: 'idle' }
  | { status: 'resolving'; source: LocationSource }
  | { status: 'resolved'; source: LocationSource; center: SearchCenter }
  | {
      status: 'error';
      source: LocationSource;
      reason: LocationErrorReason;
      kind: LocationFailureKind;
      message: string;
      canRetry: boolean;
    };

export type LocationAction =
  | { type: 'REQUEST_CURRENT' }
  | { type: 'RESOLVED'; source: LocationSource; center: SearchCenter }
  | {
      type: 'FAILED';
      source: LocationSource;
      reason: LocationErrorReason;
      kind: LocationFailureKind;
      message: string;
      canRetry: boolean;
    }
  | { type: 'RESET' };

export const initialLocationState: LocationState = { status: 'idle' };

export function locationReducer(_state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'REQUEST_CURRENT':
      return { status: 'resolving', source: 'current' };
    case 'RESOLVED':
      return { status: 'resolved', source: action.source, center: action.center };
    case 'FAILED':
      return {
        status: 'error',
        source: action.source,
        reason: action.reason,
        kind: action.kind,
        message: action.message,
        canRetry: action.canRetry,
      };
    case 'RESET':
      return { status: 'idle' };
  }
}
