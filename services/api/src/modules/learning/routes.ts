import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createLearningService, type GoalScore } from "./service.js";
import type { LearningRepository } from "./repository.js";

const goalSchema = z.object({
  studentId: z.string().min(1),
  goalScore: z.enum(["80", "100", "110+", "full-score"]),
});

const studentIdSchema = z.object({
  studentId: z.string().min(1),
});

const todayTaskQuerySchema = z.object({
  studentId: z.string().min(1),
});

const practiceAnswerSchema = z.object({
  studentId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

export async function registerLearningRoutes(app: FastifyInstance, repository: LearningRepository) {
  const service = createLearningService(repository);

  app.put("/student/profile/goal", async (request) => {
    const body = goalSchema.parse(request.body) as { studentId: string; goalScore: GoalScore };
    return service.setGoal(body.studentId, body.goalScore);
  });

  app.post("/diagnostics/initial/start", async () => ({ sessionId: "diag-1", questionCount: 12 }));

  app.post("/diagnostics/:sessionId/answers", async (request) => {
    const body = studentIdSchema.parse(request.body);
    return service.finishInitialDiagnostic(body.studentId);
  });

  app.get("/tasks/today", async (request) => {
    const query = todayTaskQuerySchema.parse(request.query);
    return service.getTodayTask(query.studentId);
  });

  app.post("/tasks/:taskId/start", async (request) => {
    return { taskId: (request.params as { taskId: string }).taskId, status: "started" };
  });

  app.post("/practice/:sessionId/answers", async (request) => {
    const body = practiceAnswerSchema.parse(request.body);
    return service.submitPracticeAnswer(body.studentId, body.questionId, body.answer);
  });

  app.get("/reports/latest", async (request, reply) => {
    const query = todayTaskQuerySchema.parse(request.query);
    const report = service.getLatestReport(query.studentId);
    if (!report) return reply.code(404).send({ error: "report_not_ready" });
    return report;
  });
}
