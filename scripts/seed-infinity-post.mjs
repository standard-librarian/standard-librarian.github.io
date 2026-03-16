#!/usr/bin/env node
/**
 * Seed script for the "Mutakallimun Infinity" post.
 * Usage: node scripts/seed-infinity-post.mjs
 * Requires TURSO_DATABASE_URL (and optionally TURSO_AUTH_TOKEN) in .env.local
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load .env.local
try {
  const envPath = resolve(ROOT, ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.warn("No .env.local found — relying on environment variables.");
}

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  console.error("Error: TURSO_DATABASE_URL is not set.");
  process.exit(1);
}

const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// ---------------------------------------------------------------------------
// Post data
// ---------------------------------------------------------------------------

const slug = "mutakallimun-infinity";
const title = "The Mutakallimun Were Right: Actual Infinity Doesn't Exist";
const date = "2026-03-16";
const tags = JSON.stringify(["philosophy", "mathematics", "infinity", "three.js"]);
const summary =
  "The medieval Islamic scholastics had a devastating argument against actual infinity. Cantor's famous diagonal proof doesn't refute them — it assumes the very thing it needs to prove.";

const content = `<DynamicComponent id="infinity-walker" />

There is a path behind you. Every moment that passed left a footprint. If you are here — reading this, thinking this — then that path had a beginning. It *had* to have a beginning. The Mutakallimun, the medieval Islamic scholastic theologians, were among the first to turn this intuition into a rigorous argument. They called it *Burhan Al-Tatbiq*: the Argument from Correspondence. And modern mathematics, for all its sophistication, has never quite answered it.

## Who Were the Mutakallimun?

The Mutakallimun (Arabic: *علم الكلام*, "science of discourse") were the systematic theologians of classical Islamic civilization — thinkers like Al-Kindi, Al-Ghazali, and Ibn Hazm who applied Greek logical method to questions of theology, metaphysics, and natural philosophy. Operating from roughly the 8th to the 13th century CE, they produced some of the most sophisticated philosophical argumentation of the medieval world.

Their engagement with infinity was not purely abstract. The question had a burning theological consequence: does the universe have a beginning? A beginningless universe implied a divine creator who had been "waiting" through infinite time before creating — an incoherence they found fatal to any coherent theology. More radically, it implied that an actually infinite series of past events *had been completed* to produce the present moment. And that, they argued, is impossible.

This isn't a parochial concern. The same argument shows up in Aristotle's *Physics*, in John Philoponus, in Al-Kindi's *On First Philosophy*, and — centuries later — in Kant's First Antinomy. The Mutakallimun gave it its sharpest formulation.

## The Two Infinities

Before the argument, a crucial distinction. There are two very different things that have been called "infinity":

**Potential infinity** — a process that can always continue. You can always add 1. The sequence 1, 2, 3... is potentially infinite: it never stops. But at any given moment, only *finitely many* steps have been taken. The tape is always unrolling; it is never fully unrolled.

**Actual infinity** — a completed whole. All the natural numbers, simultaneously existing as a finished set. The infinite decimal expansion of π, fully determined. The past, from eternity to now, as a completed sequence.

Aristotle accepted potential infinity and rejected actual infinity. Modern set theory, following Cantor, accepts both — it simply defines the concept of "actual infinite set" and works with it axiomatically. The question the Mutakallimun were asking, however, is whether actual infinity is *coherent*, and whether it can describe *physical reality*.

## Burhan Al-Tatbiq

<DynamicComponent id="infinity-tatbiq" />

The argument from correspondence is elegant and devastating. Consider two sets:

- **A** = &#123;1, 2, 3, 4, 5, 6, ...&#125; — all natural numbers
- **B** = &#123;2, 3, 4, 5, 6, 7, ...&#125; — all natural numbers greater than 1

B is clearly a *proper subset* of A. The number 1 belongs to A but not to B. By any intuitive notion of size, A should be *strictly larger* than B.

But now shift B one position to the left. 2 lines up with 1. 3 lines up with 2. Every element of B corresponds to exactly one element of A, and vice versa. There is a perfect one-to-one correspondence. According to Cantor's definition, they are the *same size*.

Use the slider above to watch the transition. At Containment View (slider = 0), the element "1" in Row A glows red: it has no partner in Row B. Row B is a strict subset. At Bijection View (slider = 1), the rows shift into alignment: every element is paired. The slide to the middle reveals the contradiction held in suspension.

The Mutakallimun's argument: **both** views are coherent. There is no fact of the matter which is "correct" — unless you have already decided, in advance, what "same size" means for infinite sets. And that decision requires you to have already accepted that actual infinite sets exist and can be meaningfully compared. The argument is circular.

Ibn Hazm put it directly: if you grant that a set can be placed in one-to-one correspondence with its own proper subset, you have not *proven* that actual infinity is coherent — you have *defined* it to be so. The definition papers over the contradiction rather than resolving it.

## What Cantor Actually Proved

<DynamicComponent id="infinity-cantor" />

Cantor's diagonal argument is one of the most celebrated results in mathematics. It proves that the real numbers cannot be put into one-to-one correspondence with the natural numbers — there are "more" real numbers than natural numbers. Walk through the steps above.

The argument is valid — *conditional on its premise*. Step 0: assume ℝ is countable, meaning there exists a *complete* list of all real numbers. From this assumption, Cantor derives a contradiction. Therefore the assumption is false.

But look at Step 4. The entire argument requires you to already possess the concept of a "complete infinite list" — an *actually infinite* object that is fully determined. The contradiction is not with infinity itself. It's with the specific assumption that a *particular* infinity (the reals) can be enumerated by a particular other infinity (the naturals).

The proof takes actual infinity for granted at Step 0. It tells you something about the *structure* of actual infinite sets: not all infinities are the same size. This is mathematically profound. But it does not answer the question of whether actual infinite sets can exist in physical reality, or whether the concept is coherent when applied to the past history of a physical universe.

## The Presupposition Problem

Here is the circularity laid bare. A defender of actual infinity might argue:

> "Cantor's diagonal proof shows that actual infinite sets have consistent internal structure. Therefore they are coherent objects."

But the Mutakallimun's response is:

> "You have shown that *if* we accept the axiom that actually infinite sets exist, we can derive interesting theorems about them. But whether that axiom corresponds to anything real — whether a completed infinite series can exist in the physical world — is precisely what is in question."

This is not a critique of Cantor's mathematics. Set theory is internally consistent (as far as we know). The question is whether the mathematical objects of set theory have *physical instantiation*. And here, the Mutakallimun's argument still bites.

To say "the past is actually infinite" is to say there exists a completed infinite series of events, each caused by the previous one, terminating at the present. But a completed series that *by definition* has no first member cannot "terminate" at anything. You cannot traverse an infinite series one step at a time and arrive at the end — because there is no end in the direction you came from, and no beginning from which you departed.

## What Infinity Actually Is

<DynamicComponent id="infinity-hotel" />

Hilbert's Hotel is the standard illustration of how actual infinity behaves. A hotel with infinitely many rooms, all full: and yet a new guest can always be accommodated. Room 1 moves to Room 2, Room 2 to Room 3, and so on. Infinitely many guests shift; Room 1 is free.

This is mathematically coherent — in the realm of abstract sets. But notice what it requires: every guest instantaneously moves. The operation is performed on the entire infinite set *simultaneously*. There is no moment of transition, no causal chain by which Room 1 becomes available before Room 2 has shifted. The operation is defined to just *work*, because that's what the axioms say.

In physical reality, such an operation would require infinite energy, infinite time, or infinite simultaneity. None of these are available. The hotel is a mathematical object, not a physical one — and the distinction matters enormously when we're discussing whether the actual past is infinite.

The counter shows ∞ + 1 = ∞ and ∞ + ∞ = ∞. These are true of cardinal numbers in set theory. They do not mean that physical infinity is achievable — they mean that the mathematical *symbol* ∞ has been given these algebraic properties by stipulation.

## The Mutakallimun's Lasting Insight

What the Mutakallimun grasped — and what is often missed in contemporary philosophy of mathematics — is the difference between *formal consistency* and *ontological coherence*.

A formal system can be internally consistent while failing to describe anything real. Euclidean geometry is internally consistent; so is non-Euclidean geometry; so are both. The question of which describes physical space is empirical, not formal. Similarly, ZFC set theory with the Axiom of Infinity is internally consistent. But whether *actual infinite collections* exist in physical reality is a question that set theory cannot answer from the inside.

When physicists speak of an "infinite past," they face the same problem. An infinite past would consist of an actually completed infinite sequence of events, each arising from the previous one. Such a sequence has no first term. A sequence with no first term cannot be built from scratch, cannot be traversed, and cannot "end" at the present moment. The present moment is the last term — but an infinite sequence in the backwards direction has no last term either.

The Mutakallimun's argument does not prove that God exists, or that the universe was created. It proves something more modest and more interesting: that the concept of a *physically actual infinity* — as opposed to a mathematical fiction — is genuinely problematic. The standard mathematical responses to this argument (Cantor's bijection, Hilbert's Hotel) dissolve once you recognize they are all operating inside the very framework whose applicability to physical reality is in question.

## The Finite Universe

<DynamicComponent id="infinity-universe" />

The observable universe contains approximately 10⁸⁰ particles. This is a very large number. It is also a finite number. Modern cosmology strongly suggests the universe has a finite past — approximately 13.8 billion years — and a finite volume of causally connected space.

The mathematical tools we use to describe it — real numbers, continuous functions, infinite-dimensional Hilbert spaces — are formal conveniences. They are not metaphysical commitments to the existence of actual infinities in nature. The map is not the territory.

The Mutakallimun were doing philosophy of physics before the discipline existed. They were asking: what must the structure of reality be, given that we are here, experiencing a present moment? Their answer — that the past must be finite, that actual infinity cannot be physically real — has been refined but not refuted by the last eight centuries of mathematics.

Cantor showed us that infinity, if it exists, comes in different sizes. He did not show us that it exists. That question remains open — and the medieval Islamic scholastics asked it first.

---

*Further reading: Al-Ghazali, Tahafut al-Falasifa (The Incoherence of the Philosophers), trans. Marmura; Ibn Hazm, Al-Fisal fi al-Milal; William Lane Craig, The Kalam Cosmological Argument; Penelope Maddy, Realism in Mathematics; John Mayberry, The Foundations of Mathematics in the Theory of Sets.*
`;

// ---------------------------------------------------------------------------
// Schema + seed
// ---------------------------------------------------------------------------

async function run() {
  // Ensure tables exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      slug         TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      date         TEXT NOT NULL,
      tags         TEXT NOT NULL DEFAULT '[]',
      summary      TEXT NOT NULL DEFAULT '',
      content      TEXT NOT NULL DEFAULT '',
      reading_time TEXT NOT NULL DEFAULT '',
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Upsert (idempotent, updates on re-run)
  await db.execute({
    sql: `INSERT INTO posts (slug, title, date, tags, summary, content, reading_time)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(slug) DO UPDATE SET
            title        = excluded.title,
            date         = excluded.date,
            tags         = excluded.tags,
            summary      = excluded.summary,
            content      = excluded.content,
            reading_time = excluded.reading_time,
            updated_at   = datetime('now')`,
    args: [slug, title, date, tags, summary, content, "9 min read"],
  });

  console.log(`✓ Post seeded: ${slug}`);
  console.log(`  Title:   ${title}`);
  console.log(`  Date:    ${date}`);

  // Verify
  const result = await db.execute({
    sql: "SELECT slug, title, date FROM posts WHERE slug = ?",
    args: [slug],
  });
  if (result.rows.length > 0) {
    console.log("  Status:  exists in database");
  } else {
    console.error("  Status:  NOT FOUND — insert may have failed");
    process.exit(1);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
