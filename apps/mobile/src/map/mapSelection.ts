import type { Cafe } from '@bean-stalker/contracts';

export function selectCafeId(cafeId: string): string {
  return cafeId;
}

export function reconcileSelectedCafeId(
  cafes: readonly Pick<Cafe, 'placeId'>[],
  selectedCafeId: string | null,
): string | null {
  return selectedCafeId && cafes.some((cafe) => cafe.placeId === selectedCafeId)
    ? selectedCafeId
    : null;
}

export function cafeIndexById(cafes: readonly Pick<Cafe, 'placeId'>[], cafeId: string): number {
  return cafes.findIndex((cafe) => cafe.placeId === cafeId);
}
