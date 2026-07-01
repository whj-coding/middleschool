import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export async function loadSchemaSql() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return readFile(join(currentDir, "schema.sql"), "utf8");
}
