import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { mockSpeechToText, mockTextToSpeech } from "./mockVoiceAdapters.js";

const sttSchema = z.object({
  audioBase64: z.string().min(1),
});

const ttsSchema = z.object({
  text: z.string().min(1),
  voice: z.string().min(1),
  speed: z.number().positive(),
});

export async function registerVoiceRoutes(app: FastifyInstance) {
  app.post("/voice/stt", async (request) => {
    const body = sttSchema.parse(request.body);
    return mockSpeechToText.transcribe(Buffer.from(body.audioBase64, "base64"));
  });

  app.post("/voice/tts", async (request) => {
    const body = ttsSchema.parse(request.body);
    return mockTextToSpeech.synthesize(body.text, { voice: body.voice, speed: body.speed });
  });
}
