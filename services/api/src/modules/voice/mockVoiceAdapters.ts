import type { Transcript, TtsOutput } from "./types.js";

export const mockSpeechToText = {
  async transcribe(_audio: Buffer): Promise<Transcript> {
    return { text: "我觉得固定费用是 3 元，每页增加 0.4 元。", confidence: 0.94, confirmed: false };
  },
};

export const mockTextToSpeech = {
  async synthesize(text: string, options: { voice: string; speed: number }): Promise<TtsOutput> {
    return { text, audioUrl: `/mock-audio/${options.voice}.mp3`, voice: options.voice, speed: options.speed };
  },
};
