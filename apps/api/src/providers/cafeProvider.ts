import type { Cafe, CafeSearchRequest } from '@bean-stalker/contracts';

export interface CafeProvider {
  searchNearby(request: CafeSearchRequest): Promise<Cafe[]>;
}
