import { describe, expect, it } from "vitest";
import { mockSpeechToText, mockTextToSpeech } from "./mockVoiceAdapters.js";

describe("voice adapters", () => {
  it("returns visible transcript and tts url", async () => {
    const transcript = await mockSpeechToText.transcribe(Buffer.from("audio"));
    const audio = await mockTextToSpeech.synthesize("先找固定费用。", { voice: "student-coach", speed: 1 });

    expect(transcript.text).toContain("我觉得固定费用是 3 元");
    expect(audio.text).toBe("先找固定费用。");
    expect(audio.audioUrl).toBe("/mock-audio/student-coach.mp3");
  });
});
