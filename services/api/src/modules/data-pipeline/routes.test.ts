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
});
