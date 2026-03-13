import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-title">{site.title}</p>
          <p className="footer-copy">Backend and platform engineering notes.</p>
        </div>
        <div className="footer-links">
          <a href={site.socials.github}>GitHub</a>
          <a href={site.socials.linkedin}>LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
