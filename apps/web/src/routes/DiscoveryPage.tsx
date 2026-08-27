import { LocationSelector } from '../location/LocationSelector';

export function DiscoveryPage() {
  return (
    <section className="page-intro">
      <h1>Bean Stalker</h1>
      <p>
        Discover nearby cafes from live Google Maps data — pick a location, compare results on a
        list and map, and save the ones you like.
      </p>

      <LocationSelector />

      <p className="placeholder-note">
        Live cafe search and results aren&apos;t wired up yet — that&apos;s coming in a later
        milestone. You can already set a search location above.
      </p>
    </section>
  );
}
