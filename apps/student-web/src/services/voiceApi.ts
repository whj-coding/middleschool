export type VoiceTranscript = {
  transcript: string;
  confidence: number;
};

const MOCK_VOICE_THOUGHT_AUDIO_BASE64 = "bW9jay12b2ljZS10aG91Z2h0";

export async function transcribeVoiceThought(fetcher: typeof fetch = fetch): Promise<VoiceTranscript> {
  const response = await fetcher("/api/voice/stt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64: MOCK_VOICE_THOUGHT_AUDIO_BASE64 }),
  });

  if (!response.ok) throw new Error("Failed to transcribe voice thought");

  const raw = (await response.json()) as {
    transcript?: unknown;
    text?: unknown;
    confidence?: unknown;
  };
  const transcript = typeof raw.transcript === "string" && raw.transcript.trim() ? raw.transcript : raw.text;
  const confidence = Number(raw.confidence);

  if (typeof transcript !== "string" || !transcript.trim() || !Number.isFinite(confidence)) {
    throw new Error("Failed to transcribe voice thought");
  }

  return {
    transcript,
    confidence,
  };
}
