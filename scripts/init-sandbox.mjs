import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = join(root, "sandbox.template", "app", "[locale]", "sandbox");
const targetDir = join(root, "src", "app", "[locale]", "sandbox");
const force = process.argv.includes("--force");

if (!existsSync(templateDir)) {
  console.error("Template not found:", templateDir);
  process.exit(1);
}

if (existsSync(targetDir)) {
  if (!force) {
    console.log("Sandbox already exists at src/app/[locale]/sandbox/");
    console.log("Use: npm run sandbox:init -- --force  to reset from template.");
    process.exit(0);
  }
  rmSync(targetDir, { recursive: true, force: true });
}

cpSync(templateDir, targetDir, { recursive: true });
console.log("UI sandbox ready.");
console.log("Path: src/app/[locale]/sandbox/");
console.log("URL:  http://localhost:3000/ru/sandbox");
console.log("This folder is gitignored — experiment freely.");
