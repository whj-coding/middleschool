import { describe, expect, it } from "vitest";
import { loadSchemaSql } from "./migrate.js";

describe("loadSchemaSql", () => {
  it("loads core, content, and data pipeline schemas in dependency order", async () => {
    const schemaSql = await loadSchemaSql();

    const usersIndex = schemaSql.indexOf("CREATE TABLE users");
    const questionsIndex = schemaSql.indexOf("CREATE TABLE questions");
    const sourceDocumentsIndex = schemaSql.indexOf("CREATE TABLE source_documents");

    expect(usersIndex).toBeGreaterThanOrEqual(0);
    expect(questionsIndex).toBeGreaterThan(usersIndex);
    expect(sourceDocumentsIndex).toBeGreaterThan(questionsIndex);
  });
});
