import Fastify from "fastify";
import { ZodError } from "zod";
import { registerAuthRoutes } from "./modules/auth/routes.js";
import { createInMemoryContentRepository } from "./modules/content/repository.js";
import { registerContentRoutes } from "./modules/content/routes.js";
import { registerDataPipelineRoutes } from "./modules/data-pipeline/routes.js";
import { createInMemoryLearningRepository } from "./modules/learning/repository.js";
import { registerLearningRoutes } from "./modules/learning/routes.js";
import { registerVoiceRoutes } from "./modules/voice/voiceRoutes.js";

export function buildServer() {
  const app = Fastify({ logger: false });
  const repository = createInMemoryLearningRepository();
  const contentRepository = createInMemoryContentRepository();

  app.setErrorHandler((error: unknown, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    return reply.send(error);
  });

  app.get("/health", async () => ({ ok: true }));
  app.register(registerAuthRoutes);
  app.register((instance) => registerLearningRoutes(instance, repository));
  app.register(registerVoiceRoutes);
  app.register((instance) => registerContentRoutes(instance, contentRepository));
  app.register(registerDataPipelineRoutes);
  return app;
}
