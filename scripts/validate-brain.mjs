import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const docsRoot = path.join(root, "docs");
const required = [
  "CLAUDE.md",
  ".claude/settings.json",
  "docs/00_HOME/Bean Stalker Brain.md",
  "docs/00_HOME/Source of Truth Map.md",
  "docs/00_HOME/Current Project State.md",
  "docs/01_BUSINESS/Source Brief.md",
  "docs/01_BUSINESS/BRD.md",
  "docs/01_BUSINESS/MVP Scope.md",
  "docs/02_DOMAIN/Search Lifecycle.md",
  "docs/02_DOMAIN/Business Rules.md",
  "docs/03_REQUIREMENTS/SRS.md",
  "docs/03_REQUIREMENTS/Traceability Matrix.md",
  "docs/04_AUTHORITY/API Key Boundaries.md",
  "docs/04_AUTHORITY/Privacy Boundaries.md",
  "docs/05_ARCHITECTURE/SDD.md",
  "docs/05_ARCHITECTURE/Data Model.md",
  "docs/06_INTERFACES/openapi.yaml",
  "docs/07_GOVERNANCE/Threat Model.md",
  "docs/08_QUALITY/Test Strategy.md",
  "docs/09_EXECUTION/Task Status.md",
  "docs/10_DECISIONS/ADR-005 Server-Side Places Proxy.md",
  "docs/12_DEMO/Golden Demo Scenario.md"
];

const fail = (title, items=[]) => { console.error(`Bean Stalker brain validation FAILED: ${title}`); for (const i of items) console.error(` - ${i}`); process.exit(1); };
const missing = required.filter(rel => !fs.existsSync(path.join(root, rel)));
if (missing.length) fail("missing required files", missing);

const allFiles=[];
function walk(dir){ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else allFiles.push(full); } }
walk(root);
const markdown=allFiles.filter(f=>f.endsWith(".md"));
const docsMarkdown=markdown.filter(f=>f.startsWith(`${docsRoot}${path.sep}`));
const empty=markdown.filter(f=>fs.statSync(f).size<20);
if(empty.length) fail("empty/trivial Markdown files", empty.map(f=>path.relative(root,f)));

for (const rel of ["package.json","manifest.json",".claude/settings.json","docs/12_DEMO/seed-manifest.json"]) {
  try { JSON.parse(fs.readFileSync(path.join(root,rel),"utf8")); } catch(e){ fail(`invalid JSON in ${rel}: ${e.message}`); }
}

const ids=new Map(); const missingFrontmatter=[];
for(const file of docsMarkdown){ const text=fs.readFileSync(file,"utf8"); const rel=path.relative(root,file); if(!text.startsWith("---\n")){missingFrontmatter.push(rel);continue;} const end=text.indexOf("\n---\n",4); if(end<0) fail(`unterminated frontmatter in ${rel}`); const header=text.slice(4,end); const m=header.match(/^id:\s*(.+)$/m); if(!m) fail(`missing frontmatter id in ${rel}`); const id=m[1].trim(); if(ids.has(id)) fail(`duplicate note id ${id}`,[ids.get(id),rel]); ids.set(id,rel); }
if(missingFrontmatter.length) fail("governed docs missing YAML frontmatter",missingFrontmatter);

const stems=new Set(docsMarkdown.map(f=>path.parse(f).name));
const relativeTargets=new Set(docsMarkdown.map(f=>path.relative(docsRoot,f).split(path.sep).join("/").replace(/\.md$/,"")));
const unresolved=[]; const wiki=/\[\[([^\]]+)\]\]/g;
for(const file of docsMarkdown){ const text=fs.readFileSync(file,"utf8"); for(const match of text.matchAll(wiki)){ const target=match[1].split("|",1)[0].split("#",1)[0].trim(); if(!target) continue; const stem=path.posix.basename(target); if(!relativeTargets.has(target)&&!stems.has(stem)) unresolved.push(`${path.relative(root,file)} -> ${target}`); } }
if(unresolved.length) fail("unresolved Obsidian wiki links",unresolved);
console.log(`Bean Stalker brain validation PASSED: ${required.length} required files, ${docsMarkdown.length} governed notes, ${ids.size} unique note IDs, 0 unresolved wiki links.`);
