import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseMarkdownQuestion } from "./markdownQuestionParser.js";
import type { ContentRepository } from "./repository.js";
import { approveQuestion, canPublishQuestion, rejectQuestion, requestQuestionChanges } from "./reviewService.js";

const markdownImportSchema = z.object({
  markdown: z.string().min(1),
});

const reviewReasonSchema = z.object({ reason: z.string() });

export async function registerContentRoutes(app: FastifyInstance, repository: ContentRepository) {
  app.post("/admin/content/import/markdown", async (request) => {
    const body = markdownImportSchema.parse(request.body);
    const question = parseMarkdownQuestion(body.markdown);
    repository.saveQuestion(question);
    return question;
  });

  app.post("/admin/questions/:questionId/approve", async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    const question = repository.findQuestion(questionId);
    if (!question) return reply.code(404).send({ error: "question_not_found" });
    const approved = approveQuestion(question);
    repository.saveQuestion(approved);
    return approved;
  });

  app.post("/admin/questions/:questionId/request-changes", async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    const question = repository.findQuestion(questionId);
    if (!question) return reply.code(404).send({ error: "question_not_found" });
    const parsed = reviewReasonSchema.safeParse(request.body);
    if (!parsed.success || !parsed.data.reason.trim()) return reply.code(400).send({ error: "review_reason_required" });
    const updated = requestQuestionChanges(question, parsed.data.reason);
    repository.saveQuestion(updated);
    return updated;
  });

  app.post("/admin/questions/:questionId/reject", async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    const question = repository.findQuestion(questionId);
    if (!question) return reply.code(404).send({ error: "question_not_found" });
    const parsed = reviewReasonSchema.safeParse(request.body);
    if (!parsed.success || !parsed.data.reason.trim()) return reply.code(400).send({ error: "review_reason_required" });
    const updated = rejectQuestion(question, parsed.data.reason);
    repository.saveQuestion(updated);
    return updated;
  });

  app.post("/admin/questions/:questionId/publish", async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    const question = repository.findQuestion(questionId);
    if (!question) return reply.code(404).send({ error: "question_not_found" });
    if (!canPublishQuestion(question)) return reply.code(409).send({ error: "question_not_approved" });
    const published = { ...question, reviewStatus: "published" as const };
    repository.saveQuestion(published);
    return published;
  });

  app.get("/student/questions/:questionId", async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    const question = repository.findQuestion(questionId);
    if (!question || question.reviewStatus !== "published") return reply.code(404).send({ error: "question_not_found" });
    return question;
  });
}
