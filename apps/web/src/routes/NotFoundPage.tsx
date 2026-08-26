import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page-intro">
      <h1>Page not found</h1>
      <p>We couldn&apos;t find that page.</p>
      <Link to="/">Return to Bean Stalker</Link>
    </section>
  );
}
