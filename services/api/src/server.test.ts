import { describe, expect, it } from "vitest";
import { buildServer } from "./server.js";

describe("student learning API", () => {
  it("runs login to latest report", async () => {
    const app = buildServer();
    const login = await app.inject({ method: "POST", url: "/auth/login", payload: { name: "张同学" } });
    const studentId = login.json().studentId;

    await app.inject({ method: "PUT", url: "/student/profile/goal", payload: { studentId, goalScore: "110+" } });
    await app.inject({ method: "POST", url: "/diagnostics/initial/start", payload: { studentId } });
    await app.inject({ method: "POST", url: "/diagnostics/diag-1/answers", payload: { studentId, answers: [] } });
    const task = await app.inject({ method: "GET", url: `/tasks/today?studentId=${studentId}` });
    const startedTask = await app.inject({ method: "POST", url: `/tasks/${task.json().id}/start`, payload: { studentId } });
    const practice = await app.inject({
      method: "POST",
      url: "/practice/practice-1/answers",
      payload: { studentId, taskId: "task-linear-kb", questionId: "practice-printing-fee", answer: "y = 3x + 0.4" },
    });
    const report = await app.inject({ method: "GET", url: `/reports/latest?studentId=${studentId}` });

    expect(login.statusCode).toBe(200);
    expect(task.json()).toEqual(
      expect.objectContaining({
        taskContent: expect.stringContaining("图像探索"),
        estimatedMinutes: 20,
        completionStandard: expect.stringContaining("单位变化量"),
      }),
    );
    expect(task.json().learningPackageQuery).toEqual({
      knowledgeTag: "k/b意义",
      difficulty: "基础",
      ability: "概念",
    });
    expect(startedTask.json()).toEqual({ studentId, taskId: "task-linear-kb", status: "started" });
    expect(practice.json().mistake.reason).toBe("审题与建模错误");
    expect(practice.json().activeTask.status).toBe("completed");
    expect(report.json().activeTask.status).toBe("completed");
    expect(report.json().summary).toContain("从打印费理解固定费用和变化费用");
    expect(report.json().recommendationReasons).toContain("应用建模 · 需加强");
    expect(report.json().nextTask.id).toBe("task-linear-modeling");
  });

  it("rejects invalid learning payloads", async () => {
    const app = buildServer();
    const badGoal = await app.inject({
      method: "PUT",
      url: "/student/profile/goal",
      payload: { studentId: "student-1", goalScore: "bad" },
    });
    const missingPracticeAnswer = await app.inject({
      method: "POST",
      url: "/practice/practice-1/answers",
      payload: { studentId: "student-1", taskId: "task-linear-kb", questionId: "practice-printing-fee" },
    });

    expect(badGoal.statusCode).toBe(400);
    expect(missingPracticeAnswer.statusCode).toBe(400);
  });

  it("completes the task named by the practice answer payload", async () => {
    const app = buildServer();
    const studentId = "student-task-routing";

    await app.inject({ method: "POST", url: "/tasks/task-old/start", payload: { studentId } });
    await app.inject({ method: "POST", url: "/tasks/task-current/start", payload: { studentId } });
    const practice = await app.inject({
      method: "POST",
      url: "/practice/practice-1/answers",
      payload: {
        studentId,
        taskId: "task-current",
        questionId: "practice-printing-fee",
        answer: "y = 3x + 0.4",
      },
    });
    const report = await app.inject({ method: "GET", url: `/reports/latest?studentId=${studentId}` });

    expect(practice.json().activeTask).toEqual({ studentId, taskId: "task-current", status: "completed" });
    expect(report.json().activeTask).toEqual({ studentId, taskId: "task-current", status: "completed" });
  });

  it("keeps student state isolated per server instance", async () => {
    const appA = buildServer();
    const appB = buildServer();

    await appA.inject({ method: "PUT", url: "/student/profile/goal", payload: { studentId: "student-a", goalScore: "110+" } });
    await appA.inject({
      method: "POST",
      url: "/practice/practice-1/answers",
      payload: { studentId: "student-a", taskId: "task-linear-kb", questionId: "practice-printing-fee", answer: "y = 3x + 0.4" },
    });
    const reportB = await appB.inject({ method: "GET", url: "/reports/latest?studentId=student-a" });

    expect(reportB.statusCode).toBe(404);
  });

  it("requires practice evidence before returning a latest report", async () => {
    const app = buildServer();
    await app.inject({ method: "PUT", url: "/student/profile/goal", payload: { studentId: "student-1", goalScore: "110+" } });
    const report = await app.inject({ method: "GET", url: "/reports/latest?studentId=student-1" });

    expect(report.statusCode).toBe(404);
  });
});

describe("voice API", () => {
  it("returns transcript and synthesized audio metadata", async () => {
    const app = buildServer();
    const stt = await app.inject({ method: "POST", url: "/voice/stt", payload: { audioBase64: "YXVkaW8=" } });
    const tts = await app.inject({
      method: "POST",
      url: "/voice/tts",
      payload: { text: "先找固定费用。", voice: "student-coach", speed: 1 },
    });

    expect(stt.statusCode).toBe(200);
    expect(stt.json().text).toContain("固定费用");
    expect(tts.statusCode).toBe(200);
    expect(tts.json().audioUrl).toBe("/mock-audio/student-coach.mp3");
  });

  it("rejects invalid voice payloads", async () => {
    const app = buildServer();
    const stt = await app.inject({ method: "POST", url: "/voice/stt", payload: { audioBase64: "" } });
    const tts = await app.inject({
      method: "POST",
      url: "/voice/tts",
      payload: { text: "", voice: "student-coach", speed: 0 },
    });

    expect(stt.statusCode).toBe(400);
    expect(tts.statusCode).toBe(400);
  });
});

describe("content review API", () => {
  const markdown = `# 题目ID: MATH-FUNC-LINEAR-001
学科: 数学
模块: 函数
知识点: 一次函数图像
题型: 选择题
难度: 基础
能力类型: 图像
答案: B
审核状态: 待审核

## 题干
直线经过点 A(0, 2) 和 B(4, 0)，则该直线的解析式是？

## 选项
A. y = 2x + 4
B. y = -0.5x + 2

## 解析
斜率 k = -0.5，截距是 2。`;

  it("imports markdown as pending review and protects publishing", async () => {
    const app = buildServer();
    const imported = await app.inject({ method: "POST", url: "/admin/content/import/markdown", payload: { markdown } });
    const blockedPublish = await app.inject({ method: "POST", url: "/admin/questions/MATH-FUNC-LINEAR-001/publish" });
    const approved = await app.inject({ method: "POST", url: "/admin/questions/MATH-FUNC-LINEAR-001/approve" });
    const published = await app.inject({ method: "POST", url: "/admin/questions/MATH-FUNC-LINEAR-001/publish" });
    const studentQuestion = await app.inject({ method: "GET", url: "/student/questions/MATH-FUNC-LINEAR-001" });

    expect(imported.statusCode).toBe(200);
    expect(imported.json().reviewStatus).toBe("pending_review");
    expect(blockedPublish.statusCode).toBe(409);
    expect(approved.json().reviewStatus).toBe("approved");
    expect(published.json().reviewStatus).toBe("published");
    expect(studentQuestion.json().answer).toBe("B");
  });

  it("records reasoned question review transitions", async () => {
    const app = buildServer();
    await app.inject({ method: "POST", url: "/admin/content/import/markdown", payload: { markdown } });

    const blank = await app.inject({
      method: "POST",
      url: "/admin/questions/MATH-FUNC-LINEAR-001/request-changes",
      payload: { reason: "   " },
    });
    const requested = await app.inject({
      method: "POST",
      url: "/admin/questions/MATH-FUNC-LINEAR-001/request-changes",
      payload: { reason: "  解析缺少关键步骤  " },
    });
    const rejected = await app.inject({
      method: "POST",
      url: "/admin/questions/MATH-FUNC-LINEAR-001/reject",
      payload: { reason: "  题目条件错误  " },
    });
    const missing = await app.inject({
      method: "POST",
      url: "/admin/questions/not-found/reject",
      payload: { reason: "无效题目" },
    });

    expect(blank.statusCode).toBe(400);
    expect(requested.json()).toEqual(expect.objectContaining({ reviewStatus: "needs_revision", reviewReason: "解析缺少关键步骤" }));
    expect(rejected.json()).toEqual(expect.objectContaining({ reviewStatus: "rejected", reviewReason: "题目条件错误" }));
    expect(missing.statusCode).toBe(404);
  });
});
