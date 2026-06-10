import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const MODEL_CHAIN = [
  process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

function getKeys(): string[] {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean) as string[];
  return keys;
}

function isRetryable(err: unknown): boolean {
  const msg = String(err);
  return msg.includes("429") || msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("network");
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function generateWithGemini<T>(
  prompt: string,
  schema: object
): Promise<T> {
  const keys = getKeys();
  if (keys.length === 0) throw new Error("No GEMINI_API_KEY configured");

  const delays = [1500, 3000, 6000];

  for (const model of MODEL_CHAIN) {
    for (const key of keys) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const m = genAI.getGenerativeModel({
            model,
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: schema as Parameters<typeof genAI.getGenerativeModel>[0]["generationConfig"] extends { responseSchema?: infer S } ? S : never,
              temperature: 0.5,
            },
          });
          const result = await m.generateContent(prompt);
          const text = result.response.text();
          return JSON.parse(text) as T;
        } catch (err) {
          if (!isRetryable(err) && String(err).includes("400")) throw err; // auth / bad request — don't retry
          if (attempt < 2) await sleep(delays[attempt]);
        }
      }
    }
  }
  throw new Error("Gemini: all models and keys exhausted");
}
