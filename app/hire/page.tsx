import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hire Me — Backend & AI Systems Consulting",
  description:
    "Independent Backend & AI Systems Engineer (Go, Distributed Systems, Custom MCP Servers, Production AI Agents, Cloud Infra). Available for fixed-scope sprints & remote contracts.",
};

const offers = [
  {
    name: "Production AI Agents & Custom MCP Servers",
    price: "$2,000 – $5,000 / 2-week sprint",
    summary:
      "Turn fragile LLM demos into deterministic production systems, or connect your internal docs, databases, and Slack to Claude Code, Cursor, and Windsurf via custom OAuth 2.0 PKCE MCP servers.",
    deliverables: [
      "Deterministic state-machine orchestration + structured JSON extraction (zero hallucinated IDs)",
      "Hand-rolled JSON-RPC 2.0 MCP servers with OAuth 2.0 PKCE & scoped tool permissions",
      "PostgreSQL + pgvector / Qdrant hybrid search, WebSockets/SSE, Whisper STT/TTS & Arabic/English NLP",
    ],
    proof: "Built 4Sale's AI Listing Agent (10-state Go machine) & o16g (48-tool MCP server across 8 IDEs).",
  },
  {
    name: "Go Microservices, Payments & Developer Platforms",
    price: "$3,500 – $6,000 / mo retainer · or $55–$85/hr",
    summary:
      "High-throughput backend architecture for scaling marketplaces, fintechs, and SaaS platforms hitting monolith or messaging bottlenecks.",
    deliverables: [
      "Clean/Hexagonal Go services (Echo, Gin, PostgreSQL, Redis) with Godog BDD + Testcontainers",
      "Public developer APIs: API keys, bulk ingestion endpoints, HMAC-signed webhooks & usage analytics",
      "Payment gateways (Stripe, KNet, Mada), wallets, subscriptions & Kafka / RabbitMQ Super Streams Sagas",
    ],
    proof: "Shipped 4Sale's Developer Platform, Cashier/Kafka Saga & open-sourced shapeshifter + rabbitmq-super-stream.",
  },
  {
    name: "Cloud Cost Reduction & Centralized Auth (Keycloak / SFTP / K8s)",
    price: "$1,500 – $4,000 fixed scope",
    summary:
      "Replace painful AWS managed-service bills with audited, self-hosted Go infrastructure and consolidate fragmented admin logins into unified SSO/RBAC.",
    deliverables: [
      "Self-hosted SFTPGo + MinIO replacements eliminating AWS Transfer Family ($0.30/GB) fees",
      "Centralized Keycloak SSO, RBAC, MFA & unified multi-panel admin consoles",
      "Docker, Kubernetes CI/CD hardening & Java Spring Boot microservice modernization",
    ],
    proof: "Open-sourced sftpgo-manager (replaced AWS Transfer Family) & unified SSO across 6+ internal panels.",
  },
  {
    name: "3-Day Architecture Audit & Implementation Spike",
    price: "$750 – $1,200 fixed",
    summary:
      "A fast, low-risk starting point when scope is unclear or a production system is stalling. You get a concrete diagnosis, working proof-of-concept, and a fixed quote for full execution.",
    deliverables: [
      "Deep codebase, database query, messaging & security/auth audit",
      "Prioritized remediation roadmap with exact effort estimates",
      "Working PoC PR or critical hotfix merged into your repository",
    ],
    proof: "Fastest way to de-risk a build or unblock a stalled engineering sprint.",
  },
];

const proofLinks = [
  {
    name: "sftpgo-manager",
    desc: "Self-hosted multi-tenant SFTP replacing AWS Transfer Family ($0.30/GB eliminated).",
    href: "https://github.com/standard-librarian/sftpgo-manager",
  },
  {
    name: "shapeshifter",
    desc: "Versioned JSON HTTP contract middleware for Go (Echo, Gin, Chi, Fiber).",
    href: "https://github.com/standard-librarian/shapeshifter",
  },
  {
    name: "rabbitmq-super-stream",
    desc: "PHP + embedded Go sidecar on Packagist for zero-downtime legacy migrations.",
    href: "https://github.com/standard-librarian/rabbitmq-super-stream",
  },
  {
    name: "context-engineer",
    desc: "AI-native organizational knowledge graph & local semantic search.",
    href: "https://github.com/standard-librarian/context-engineer",
  },
];

export default function HirePage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="reveal">
          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span
                className="tag"
                style={{
                  borderColor: "rgba(34, 197, 94, 0.45)",
                  color: "#4ade80",
                  background: "rgba(34, 197, 94, 0.08)",
                }}
              >
                ● Available for Freelance &amp; Contract Work
              </span>
              <span className="tag">Cairo (GMT+2) · EU / GCC / US East Overlap</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: "clamp(2rem, 3.8vw, 3.2rem)" }}>
              Production Go Backends, AI Agents &amp; MCP Systems — Shipped Fast.
            </h1>

            <p className="hero-lead" style={{ maxWidth: "68ch" }}>
              I&apos;m <strong>Medhat Mohammed</strong>, a senior backend &amp; AI systems engineer
              (ex-4Sale International, ex-Opream). I help startups and engineering teams ship
              reliable Go/Java microservices, custom MCP servers, payment &amp; webhook platforms,
              and lower-cost self-hosted infrastructure — without fragile demo code or bloated
              agency overhead.
            </p>

            <div className="hero-cta" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <a
                className="btn primary"
                href="mailto:mdht.muhd@gmail.com?subject=Consulting%20%2F%20Project%20Inquiry"
              >
                Email: mdht.muhd@gmail.com
              </a>
              <a
                className="btn ghost"
                href="https://wa.me/201032123841?text=Hi%20Medhat%2C%20I%27d%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Direct
              </a>
              <Link className="btn ghost" href="/resume">
                View Full Resume
              </Link>
            </div>
          </div>

          {/* Productized Offers */}
          <div style={{ marginBottom: 56 }}>
            <h2 className="section-title">How We Can Work Together</h2>
            <div style={{ display: "grid", gap: 20 }}>
              {offers.map((offer) => (
                <div
                  key={offer.name}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 12,
                    padding: "24px 26px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "1.18rem", fontWeight: 600 }}>
                      {offer.name}
                    </h3>
                    <span className="tag" style={{ color: "var(--ink)" }}>
                      {offer.price}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: "0.96rem" }}>
                    {offer.summary}
                  </p>
                  <ul className="resume-bullets" style={{ marginBottom: 14 }}>
                    {offer.deliverables.map((d) => (
                      <li key={d} className="resume-bullet">
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div style={{ fontSize: "0.86rem", color: "var(--muted)" }}>
                    <strong style={{ color: "var(--ink)" }}>Proven in production:</strong>{" "}
                    {offer.proof}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Source Proof */}
          <div style={{ marginBottom: 56 }}>
            <h2 className="section-title">Public Engineering Proof</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {proofLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: "18px 20px",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{item.name} ↗</div>
                  <div style={{ fontSize: "0.88rem", color: "var(--muted)" }}>{item.desc}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Full-Squad Option */}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              padding: "24px 26px",
              marginBottom: 48,
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem" }}>
              Need a Full Product Team (Mobile + Web + Backend)?
            </h2>
            <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: "0.95rem" }}>
              For GCC &amp; global startups launching turnkey marketplaces, booking platforms,
              telehealth, or fintech MVPs, I also collaborate with a senior Cairo-based product
              delivery squad covering <strong>Native iOS (Swift 6)</strong>,{" "}
              <strong>Android (Kotlin/Compose)</strong>, <strong>Next.js</strong>,{" "}
              <strong>Go/Temporal/Spring Boot</strong>, and GCC payment &amp; regulatory compliance
              (Mada, Apple Pay, KNet, PDPL/SDAIA).
            </p>
            <a
              className="btn primary"
              href="mailto:mdht.muhd@gmail.com?subject=Full-Squad%20Product%20Build%20Inquiry"
            >
              Request Squad Capabilities Deck
            </a>
          </div>

          {/* Direct Contact Footer CTA */}
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: 28,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                Have a repo, spec, or bottleneck?
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.92rem" }}>
                Send a short note — I reply within 12 hours with concrete technical thoughts.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn primary" href="mailto:mdht.muhd@gmail.com">
                mdht.muhd@gmail.com
              </a>
              <a
                className="btn ghost"
                href="https://www.linkedin.com/in/mdht-mohd/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
