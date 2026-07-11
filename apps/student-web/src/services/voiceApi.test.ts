import { describe, expect, it, vi } from "vitest";
import { transcribeVoiceThought } from "./voiceApi";

describe("voiceApi", () => {
  it("transcribes a mock voice thought through the API proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        transcript: "我觉得 3 元是固定费用，0.4 元才是每页变化费用。",
        confidence: 0.92,
      }),
    });

    const result = await transcribeVoiceThought(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/voice/stt",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: "bW9jay12b2ljZS10aG91Z2h0" }),
      }),
    );
    expect(result.transcript).toBe("我觉得 3 元是固定费用，0.4 元才是每页变化费用。");
    expect(result.confidence).toBe(0.92);
  });

  it("maps the backend voice transcription contract into the student transcript shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        text: "我确认 3 元是固定费用，0.4 元是每页变化费用。",
        confidence: 0.93,
        confirmed: true,
      }),
    });

    const result = await transcribeVoiceThought(fetchMock);

    expect(result).toEqual({
      transcript: "我确认 3 元是固定费用，0.4 元是每页变化费用。",
      confidence: 0.93,
    });
  });

  it("throws when voice transcription fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(transcribeVoiceThought(fetchMock)).rejects.toThrow("Failed to transcribe voice thought");
  });

  it.each(["unknown", null, "", false, -0.1, 1.1])(
    "throws when voice transcription confidence is invalid: %s",
    async (confidence) => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          text: "我确认 3 元是固定费用，0.4 元是每页变化费用。",
          confidence,
          confirmed: true,
        }),
      });

      await expect(transcribeVoiceThought(fetchMock)).rejects.toThrow("Failed to transcribe voice thought");
    },
  );
});
