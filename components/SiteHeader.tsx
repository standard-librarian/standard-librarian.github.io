"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="nav-shell">
          <Link className="logo" href="/">
            Mdht
          </Link>
          <nav className="nav-links">
            <Link href="/posts">Posts</Link>
            <Link href="/oss">OSS</Link>
            <Link href="/about">About</Link>
            <Link href="/resume">Resume</Link>
          </nav>
          <button
            className="search-trigger"
            type="button"
            onClick={() => window.dispatchEvent(new Event("cmdk:open"))}
          >
            <svg className="search-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="search-label">Search</span>
            <span className="search-keys">
              <kbd className="search-key">⌘</kbd>
              <kbd className="search-key">K</kbd>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
