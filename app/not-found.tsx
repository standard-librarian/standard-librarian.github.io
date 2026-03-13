import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="reveal">
          <h1 className="section-title">Page not found</h1>
          <p className="card-summary">
            The page you are looking for does not exist. Head back to the homepage.
          </p>
          <Link className="btn primary" href="/">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
