import { describe, expect, it } from "vitest";
import { buildServer } from "../../server.js";

describe("data pipeline routes", () => {
  it("records student interaction", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/student/interactions",
      payload: {
        studentId: "student-1",
        taskId: "task-linear-kb",
        questionId: "practice-printing-fee",
        action: "request_hint",
        hintLevel: 1,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().studentId).toBe("student-1");
  });

  it("returns approved package candidates", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "GET",
      url: "/admin/data-pipeline/content-units/package?knowledgeTag=k%2Fb%E6%84%8F%E4%B9%89&difficulty=%E5%9F%BA%E7%A1%80&ability=%E6%A6%82%E5%BF%B5",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("units");
  });

  it("lists and approves content units before package composition", async () => {
    const app = buildServer();

    const listed = await app.inject({
      method: "GET",
      url: "/admin/data-pipeline/content-units",
    });
    const approved = await app.inject({
      method: "POST",
      url: "/admin/data-pipeline/content-units/unit-linear-scenario/approve",
    });
    const packageResponse = await app.inject({
      method: "GET",
      url: "/admin/data-pipeline/content-units/package?knowledgeTag=%E6%89%93%E5%8D%B0%E8%B4%B9%E5%BB%BA%E6%A8%A1&difficulty=%E5%9F%BA%E7%A1%80&ability=%E5%BA%94%E7%94%A8",
    });

    expect(listed.statusCode).toBe(200);
    expect(listed.json().units).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "unit-linear-scenario", reviewStatus: "pending_review" })]),
    );
    expect(approved.statusCode).toBe(200);
    expect(approved.json().reviewStatus).toBe("approved");
    expect(packageResponse.json().units.map((unit: { id: string }) => unit.id)).toContain("unit-linear-scenario");
  });
});
