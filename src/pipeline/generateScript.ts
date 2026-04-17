import Anthropic from "@anthropic-ai/sdk";
import { Script, ScriptSchema } from "../types";

const DEFAULT_MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are a scriptwriter for short, punchy 10-30 second narrated videos.
Return JSON only, matching this shape:
{
  "title": "short title",
  "scenes": [
    { "caption": "max 6 words, headline style", "narration": "one or two sentences spoken aloud" }
  ]
}

Rules:
- 3 to 5 scenes total.
- Total narration across all scenes: 40 to 75 words (this targets 10-30 seconds of natural speech).
- Each caption is a 2-6 word punchy headline, not a full sentence.
- Each narration is plain prose suitable for text-to-speech. No emojis, no markdown, no quotation marks around speech.
- Keep facts accurate. If the topic is abstract, make it concrete with examples.`;

export async function generateScript(topic: string): Promise<Script> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key."
    );
  }
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Topic: ${topic}\n\nReturn JSON only, no prose before or after.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }
  const raw = textBlock.text.trim();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Could not find JSON in Claude response:\n${raw}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error(
      `Claude returned invalid JSON: ${(err as Error).message}\n${raw}`
    );
  }

  const result = ScriptSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Script failed validation: ${result.error.message}\nGot: ${JSON.stringify(parsed, null, 2)}`
    );
  }
  return result.data;
}
