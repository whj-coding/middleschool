import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const schemaFiles = ["schema.sql", "content-schema.sql", "data-pipeline-schema.sql"];

export async function loadSchemaSql() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const schemas = await Promise.all(
    schemaFiles.map((schemaFile) => readFile(join(currentDir, schemaFile), "utf8")),
  );
  return schemas.join("\n\n");
}
