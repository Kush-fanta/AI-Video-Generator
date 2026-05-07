import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const registryPath = path.join(process.cwd(), "registry.json");
export const feedbackDir = path.join(process.cwd(), "feedback");

export function ensureSafeProject(project: string) {
  return project.replace(/[^a-z0-9._-]/gi, "_");
}

export function feedbackPath(project: string) {
  return path.join(feedbackDir, `${ensureSafeProject(project)}.json`);
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  const raw = await readFile(filePath, "utf8").catch(() => null);
  if (!raw) return fallback;
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true }).catch(() => undefined);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function exists(filePath: string) {
  try {
    const s = await stat(filePath);
    return s.isFile();
  } catch {
    return false;
  }
}

export async function listFeedbackFiles() {
  const safe = await exists(feedbackDir);
  if (!safe) return [];
  const items = await readdir(feedbackDir, { withFileTypes: true });
  return items.filter((item) => item.isFile() && item.name.endsWith(".json"));
}
