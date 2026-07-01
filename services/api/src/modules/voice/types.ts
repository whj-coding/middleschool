export type Transcript = {
  text: string;
  confidence: number;
  confirmed: boolean;
};

export type TtsOutput = {
  text: string;
  audioUrl: string;
  voice: string;
  speed: number;
};
