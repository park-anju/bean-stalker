import fs from "node:fs";
import path from "node:path";
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const files = [
  "docs/00_HOME/Current Project State.md",
  "docs/00_HOME/Current Execution Focus.md",
  "docs/00_HOME/Known Blockers.md"
];
const sections = [];
for (const rel of files) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) sections.push(`\n--- ${rel} ---\n${fs.readFileSync(full, "utf8").slice(0, 7000)}`);
}
console.log(JSON.stringify({hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:"Bean Stalker live execution context. Treat canonical specifications according to Source of Truth Map.\n" + sections.join("\n")}}));
