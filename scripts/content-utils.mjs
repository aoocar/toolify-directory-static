import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export const defaultVaultPath = "E:\\Obsidian\\www.limingdao.com";

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  return {
    data: yaml.load(match[1]) ?? {},
    body: match[2] ?? ""
  };
}

export function writeMarkdown(filePath, data, body = "") {
  ensureDir(path.dirname(filePath));
  const yamlText = yaml.dump(cleanForYaml(data), {
    lineWidth: 100,
    noRefs: true,
    sortKeys: false
  });
  fs.writeFileSync(filePath, `---\n${yamlText}---\n${body.trim() ? `${body.trim()}\n` : ""}`, "utf8");
}

export function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(dir, name));
}

export function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function dateOnly(value = new Date()) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value || "").trim();
  if (!text) return new Date().toISOString().slice(0, 10);
  return text.slice(0, 10);
}

export function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function cleanForYaml(value) {
  if (value instanceof Date) return dateOnly(value);
  if (Array.isArray(value)) return value.map(cleanForYaml);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, cleanForYaml(item)])
    );
  }
  return value;
}
