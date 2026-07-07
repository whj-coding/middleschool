import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createDataPipelineRepository } from "./repository.js";
import { createDataPipelineService } from "./service.js";

const packageQuerySchema = z.object({
  knowledgeTag: z.string().min(1).default("k/b意义"),
  difficulty: z.enum(["基础", "提升", "冲刺"]).default("基础"),
  ability: z.enum(["概念", "表达式", "图像", "应用", "综合"]).default("概念"),
});

const interactionSchema = z.object({
  studentId: z.string().min(1),
  taskId: z.string().min(1).optional(),
  questionId: z.string().min(1).optional(),
  contentUnitId: z.string().min(1).optional(),
  action: z.enum([
    "view_content",
    "submit_answer",
    "request_hint",
    "view_explanation",
    "view_full_answer",
    "voice_input",
    "rate_ai_response",
  ]),
  studentAnswer: z.string().optional(),
  hintLevel: z.number().int().min(0).optional(),
  timeToAnswerMs: z.number().int().min(0).optional(),
  correct: z.boolean().nullable().optional(),
  aiResponse: z.string().optional(),
  feedbackRating: z.number().int().min(1).max(5).optional(),
});

export async function registerDataPipelineRoutes(app: FastifyInstance) {
  const repository = createDataPipelineRepository();
  repository.saveContentUnit({
    id: "unit-linear-kb-concept",
    chunkType: "concept",
    contentMarkdown: "k 表示单位变化量，b 表示初始量。",
    knowledgeTags: ["一次函数", "k/b意义"],
    difficulty: "基础",
    ability: "概念",
    errorTypes: ["概念理解错误"],
    reviewStatus: "approved",
    qualityScore: 0.95,
    usageCount: 0,
  });
  repository.saveContentUnit({
    id: "unit-linear-scenario",
    chunkType: "scenario",
    contentMarkdown: "打印店总费用可以拆成固定服务费和每页变化费用。",
    knowledgeTags: ["一次函数", "打印费建模"],
    difficulty: "基础",
    ability: "应用",
    errorTypes: ["审题与建模错误"],
    reviewStatus: "pending_review",
    qualityScore: 0.88,
    usageCount: 0,
  });

  const service = createDataPipelineService(repository);

  app.get("/admin/data-pipeline/content-units", async () => service.listContentUnits());

  app.post("/admin/data-pipeline/content-units/:unitId/approve", async (request, reply) => {
    const { unitId } = request.params as { unitId: string };
    const unit = service.approveContentUnit(unitId);
    if (!unit) return reply.code(404).send({ error: "content_unit_not_found" });
    return unit;
  });

  app.get("/admin/data-pipeline/content-units/package", async (request) => {
    const query = packageQuerySchema.parse(request.query);
    return service.composeLearningPackage(query);
  });

  app.post("/student/interactions", async (request, reply) => {
    const body = interactionSchema.parse(request.body);
    const log = service.recordInteraction(body);
    return reply.code(201).send(log);
  });
}
