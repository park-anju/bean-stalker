import { FavoriteStoreSchema, type FavoriteStore } from '@bean-stalker/contracts';
import { EMPTY_FAVORITE_STORE } from '@bean-stalker/domain';

/**
 * The one place the favourites localStorage key and its (de)serialization
 * live. Everything else in the app talks to favourites through
 * {@link FavoritesProvider}, not `localStorage` directly.
 *
 * See [[ADR-004 Favorites Local Storage]], [[Favorite Cafe Model]] and
 * [[Local State Recovery Runbook]].
 */
export const FAVORITES_STORAGE_KEY = 'bean-stalker:favorites';

export interface WriteResult {
  ok: boolean;
}

/**
 * Reads the persisted favourites, treating storage as fully untrusted input:
 * a missing entry, unparseable JSON, the wrong shape, or an unsupported
 * `version` (the schema pins `version: 1`) all degrade to an empty store
 * rather than throwing. A bad read is **never** rewritten here — recovery
 * only happens on the next real favourite mutation.
 */
export function readFavoriteStore(): FavoriteStore {
  let raw: string | null;
  try {
    raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
  } catch {
    // localStorage disabled / blocked by privacy settings / SecurityError.
    return EMPTY_FAVORITE_STORE;
  }

  if (raw === null) {
    return EMPTY_FAVORITE_STORE;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_FAVORITE_STORE;
  }

  const result = FavoriteStoreSchema.safeParse(parsed);
  return result.success ? result.data : EMPTY_FAVORITE_STORE;
}

/**
 * Persists a favourites store. Validates the shape first (defensive — the
 * domain helpers already produce valid stores), then attempts the write.
 * Returns `{ ok: false }` on a schema mismatch or a thrown Storage exception
 * (quota, disabled, security) instead of throwing, so the caller can keep the
 * UI honest about whether the change was actually saved.
 */
export function writeFavoriteStore(store: FavoriteStore): WriteResult {
  if (!FavoriteStoreSchema.safeParse(store).success) {
    return { ok: false };
  }
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(store));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
