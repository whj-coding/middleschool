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
    await app.inject({ method: "POST", url: `/tasks/${task.json().id}/start`, payload: { studentId } });
    const practice = await app.inject({
      method: "POST",
      url: "/practice/practice-1/answers",
      payload: { studentId, questionId: "practice-printing-fee", answer: "y = 3x + 0.4" },
    });
    const report = await app.inject({ method: "GET", url: `/reports/latest?studentId=${studentId}` });

    expect(login.statusCode).toBe(200);
    expect(practice.json().mistake.reason).toBe("审题与建模错误");
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
      payload: { studentId: "student-1", questionId: "practice-printing-fee" },
    });

    expect(badGoal.statusCode).toBe(400);
    expect(missingPracticeAnswer.statusCode).toBe(400);
  });

  it("keeps student state isolated per server instance", async () => {
    const appA = buildServer();
    const appB = buildServer();

    await appA.inject({ method: "PUT", url: "/student/profile/goal", payload: { studentId: "student-a", goalScore: "110+" } });
    await appA.inject({
      method: "POST",
      url: "/practice/practice-1/answers",
      payload: { studentId: "student-a", questionId: "practice-printing-fee", answer: "y = 3x + 0.4" },
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
});
