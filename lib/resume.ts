import { readFileSync } from "fs";
import { join } from "path";

// ─── Inline LaTeX → HTML ────────────────────────────────────────────────────

function texInline(s: string): string {
  return s
    .replace(/\\textbf\{([^{}]+)\}/g, "<strong>$1</strong>")
    .replace(/\\textit\{([^{}]+)\}/g, "<em>$1</em>")
    .replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(/\\url\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\\textsc\{([^{}]+)\}/g, "$1")
    .replace(/\$\\rightarrow\$/g, "→")
    .replace(/\$\|?\s*\$/g, "")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Brace extractor ────────────────────────────────────────────────────────

function extractArg(s: string, from: number): [string, number] {
  let pos = from;
  while (pos < s.length && s[pos] !== "{") pos++;
  if (pos >= s.length) return ["", pos];
  pos++; // skip {
  let depth = 1;
  let out = "";
  while (pos < s.length && depth > 0) {
    const ch = s[pos];
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { pos++; break; } }
    if (depth > 0) out += ch;
    pos++;
  }
  return [out.trim(), pos];
}

function extractArgs(s: string, from: number, n: number): [string[], number] {
  let pos = from;
  const args: string[] = [];
  for (let i = 0; i < n; i++) {
    const [arg, next] = extractArg(s, pos);
    args.push(arg);
    pos = next;
  }
  return [args, pos];
}

// ─── Item list parser ────────────────────────────────────────────────────────

function extractItems(block: string): string[] {
  const items: string[] = [];
  let pos = 0;
  while (true) {
    const idx = block.indexOf("\\resumeItem{", pos);
    if (idx === -1) break;
    const [text, next] = extractArg(block, idx + "\\resumeItem".length);
    items.push(texInline(text));
    pos = next;
  }
  return items;
}

// ─── Skill line parser ───────────────────────────────────────────────────────

function parseSkills(line: string): string[] {
  // Strip "Skills:" prefix and split on $ | $, |, or $\mid$
  const clean = line
    .replace(/^Skills?:\s*/i, "")
    .replace(/\$\s*\\mid\s*\$/g, "|")
    .replace(/\$\s*\|\s*\$/g, "|")
    .replace(/\s*\$\|\$\s*/g, "|");
  return clean.split(/\s*\|\s*|\s*,\s*/).map((s) => s.trim()).filter(Boolean);
}

function read(file: string): string {
  return readFileSync(join(process.cwd(), "resume/sections", file), "utf8");
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkEntry {
  title: string;
  org: string;
  period: string;
  location: string;
  bullets: string[];
  skills: string[];
}

export interface ProjectEntry {
  name: string;
  tech: string;
  bullets: string[];
  link?: string;
}

export interface VolunteerEntry {
  title: string;
  org: string;
  period: string;
  bullets: string[];
}

export interface ScholarshipEntry {
  title: string;
  org: string;
  period: string;
  bullets: string[];
}

export interface Resume {
  work: WorkEntry[];
  projects: ProjectEntry[];
  volunteer: VolunteerEntry[];
  scholarship: ScholarshipEntry[];
  education: { institution: string; location: string; degree: string };
  interests: string[];
}

// ─── Section parsers ─────────────────────────────────────────────────────────

function parseWork(): WorkEntry[] {
  const src = read("work.tex");
  const entries: WorkEntry[] = [];
  let pos = 0;
  while (true) {
    const idx = src.indexOf("\\resumeSubheadingWork", pos);
    if (idx === -1) break;

    const [args, after] = extractArgs(src, idx + "\\resumeSubheadingWork".length, 6);
    // args: [title, date, org, location, "", ""]
    const title = texInline(args[0]);
    const period = texInline(args[1]);
    const org = texInline(args[2]);
    const location = texInline(args[3]);

    // Find the item block
    const listStart = src.indexOf("\\resumeItemListStart", after);
    const listEnd = src.indexOf("\\resumeItemListEnd", listStart);
    const block = src.slice(listStart, listEnd);
    const bullets = extractItems(block);

    // The trailing {skills} arg comes right after \resumeItemListEnd
    const [skillsLine, nextPos] = extractArg(src, listEnd + "\\resumeItemListEnd".length);
    const skills = parseSkills(skillsLine);

    entries.push({ title, org, period, location, bullets, skills });
    pos = nextPos;
  }
  return entries;
}

function parseProjects(): ProjectEntry[] {
  const src = read("projects.tex");
  const entries: ProjectEntry[] = [];
  let pos = 0;
  while (true) {
    const idx = src.indexOf("\\resumeProjectHeading", pos);
    if (idx === -1) break;

    const [args, after] = extractArgs(src, idx + "\\resumeProjectHeading".length, 2);
    // args[0] may be \textbf{name} (Open Source) — convert via texInline then strip HTML tags
    const name = texInline(args[0]).replace(/<\/?strong>/g, "").replace(/<\/?em>/g, "");
    const tech = texInline(args[1]);

    const listStart = src.indexOf("\\resumeItemListStart", after);
    const listEnd = src.indexOf("\\resumeItemListEnd", listStart);
    const block = src.slice(listStart, listEnd);
    const bullets = extractItems(block);

    // Optional link/footer arg
    const [footer, nextPos] = extractArg(src, listEnd + "\\resumeItemListEnd".length);
    // footer might be a \href or plain text
    const linkMatch = footer.match(/\\href\{([^}]+)\}/);
    const link = linkMatch ? linkMatch[1] : undefined;

    entries.push({ name, tech, bullets, link });
    pos = nextPos;
  }
  return entries;
}

function parseVolunteer(): VolunteerEntry[] {
  const src = read("volunteer.tex");
  const entries: VolunteerEntry[] = [];
  let pos = 0;
  while (true) {
    // Match both \resumeSubheadingWork and \resumeSubheading
    const idxWork = src.indexOf("\\resumeSubheadingWork", pos);
    const idxSimple = src.indexOf("\\resumeSubheading\n", pos);
    const idx = Math.min(
      idxWork === -1 ? Infinity : idxWork,
      idxSimple === -1 ? Infinity : idxSimple,
    );
    if (!isFinite(idx)) break;

    const macro = src[idx + "\\resumeSubheading".length] === "W"
      ? "\\resumeSubheadingWork"
      : "\\resumeSubheading";

    const numArgs = macro === "\\resumeSubheadingWork" ? 6 : 4;
    const [args, after] = extractArgs(src, idx + macro.length, numArgs);
    const title = texInline(args[0]);
    const period = texInline(args[1]);
    const org = texInline(args[2]);

    const listStart = src.indexOf("\\resumeItemListStart", after);
    const listEnd = src.indexOf("\\resumeItemListEnd", listStart);
    const block = src.slice(listStart, listEnd);
    const bullets = extractItems(block);

    entries.push({ title, org, period, bullets });
    pos = listEnd + "\\resumeItemListEnd".length;
  }
  return entries;
}

function parseScholarship(): ScholarshipEntry[] {
  const src = read("scholarship.tex");
  const entries: ScholarshipEntry[] = [];
  let pos = 0;
  while (true) {
    const idx = src.indexOf("\\resumeSubheading", pos);
    if (idx === -1) break;
    const [args, after] = extractArgs(src, idx + "\\resumeSubheading".length, 4);
    const title = texInline(args[0]);
    const period = texInline(args[1]);
    const org = texInline(args[2]);

    const listStart = src.indexOf("\\resumeItemListStart", after);
    const listEnd = src.indexOf("\\resumeItemListEnd", listStart);
    const block = src.slice(listStart, listEnd);
    const bullets = extractItems(block);

    entries.push({ title, org, period, bullets });
    pos = listEnd + "\\resumeItemListEnd".length;
  }
  return entries;
}

function parseEducation() {
  const src = read("education.tex");
  const institutionMatch = src.match(/\\textbf\{([^}]+)\}/);
  const locationMatch = src.match(/\$\|\$\s*([^\\\n]+)/);
  const degreeMatch = src.match(/Bachelor[^\n\\]+/);
  return {
    institution: institutionMatch ? institutionMatch[1].trim() : "",
    location: locationMatch ? locationMatch[1].trim() : "Cairo, Egypt",
    degree: degreeMatch ? degreeMatch[0].trim().replace(/\s+/g, " ") : "",
  };
}

function parseInterests(): string[] {
  const src = read("interests.tex");
  return extractItems(src);
}

// ─── Main export ─────────────────────────────────────────────────────────────

let _cache: Resume | undefined;

export function getResume(): Resume {
  if (_cache) return _cache;
  _cache = {
    work: parseWork(),
    projects: parseProjects(),
    volunteer: parseVolunteer(),
    scholarship: parseScholarship(),
    education: parseEducation(),
    interests: parseInterests(),
  };
  return _cache;
}
