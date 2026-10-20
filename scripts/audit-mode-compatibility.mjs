import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sourceRevision } from "../apps/core/noname/init/mushoku-compatibility.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const git = args => execFileSync("git", args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const files = git(["ls-tree", "-r", "--name-only", sourceRevision, "apps/core/mode", "apps/core/card"]).toString().trim().split(/\r?\n/);
const mismatches = [];
const intentionalChanges = [];
for (const file of files) {
 const before = git(["show", `${sourceRevision}:${file}`]).toString("utf8").replace(/\r\n/g, "\n");
 const after = (await readFile(path.join(root, file), "utf8")).replace(/\r\n/g, "\n");
 if (createHash("sha256").update(before).digest("hex") !== createHash("sha256").update(after).digest("hex")) {
  if (file === "apps/core/mode/connect.js") intentionalChanges.push({ file, reason: "Sakura Frp address screen and tunnel setup help; gameplay rules unchanged" });
  else mismatches.push(file);
 }
}
const report = { sourceRevision, checkedFiles: files.length, modeFiles: files.filter(p => p.startsWith("apps/core/mode/")).length,
 cardFiles: files.filter(p => p.startsWith("apps/core/card/")).length, mismatches, intentionalChanges, result: mismatches.length ? "FAIL" : "PASS",
 scope: "Tracked mode/card source contents, ignoring CRLF vs LF only. Runtime admission restricts unsupported modes; source equality does not imply every mode is enabled or certified." };
await mkdir(path.join(root, "output/compatibility"), { recursive: true });
await writeFile(path.join(root, "output/compatibility/source-audit.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (mismatches.length) process.exitCode = 1;
