import { MdhtPortrait } from "@/components/MdhtPortrait";

export function MdhtHero() {
  return (
    <div className="mdht-hero">
      <div className="mdht-hero-text">
        <p className="mdx-p">
          I'm Mdht. I build software, think about math, read old books, and occasionally write
          things worth reading. My interests don't fit neatly into one box — which is probably
          why I have a blog instead of a LinkedIn summary.
        </p>
        <p className="mdx-p">
          By day I work on backend systems and developer platforms, mostly in Go. By night (and
          honestly also by day) I fall down rabbit holes: category theory, classical Islamic
          logic texts, array languages, AI agents that actually work. This blog is the place
          where all of that leaks out.
        </p>
      </div>
      <MdhtPortrait />
    </div>
  );
}
