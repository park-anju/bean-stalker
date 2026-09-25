import type { Cafe, OpenStatus } from '@bean-stalker/contracts';

export function formatCafeDistance(distanceMeters: number): string {
  return distanceMeters < 1000
    ? String(Math.round(distanceMeters)) + ' m'
    : (distanceMeters / 1000).toFixed(1) + ' km';
}

export function formatCafeOpenStatus(status: OpenStatus): string {
  if (status === 'OPEN') return 'Open';
  if (status === 'CLOSED') return 'Closed';
  return 'Hours unavailable';
}

export function cafeCardAccessibilityLabel(cafe: Cafe): string {
  const rating = cafe.rating === undefined ? '' : ', rated ' + cafe.rating;
  const address = cafe.formattedAddress === undefined ? '' : ', ' + cafe.formattedAddress;
  return (
    cafe.name +
    ', ' +
    formatCafeDistance(cafe.distanceMeters) +
    rating +
    ', ' +
    formatCafeOpenStatus(cafe.openStatus) +
    address
  );
}

export function cafeCardAccessibilityState(selected: boolean) {
  return { selected };
}
