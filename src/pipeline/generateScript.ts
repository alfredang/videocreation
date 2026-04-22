import { execFile } from "node:child_process";
import { Script, ScriptSchema } from "../types";

const CLAUDE_BIN =
  process.env.CLAUDE_BIN ?? "claude";

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

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      CLAUDE_BIN,
      ["-p", "--output-format", "text"],
      { maxBuffer: 1024 * 1024, timeout: 60_000 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`claude CLI failed: ${err.message}\n${stderr}`));
          return;
        }
        resolve(stdout.trim());
      },
    );
    child.stdin?.write(prompt);
    child.stdin?.end();
  });
}

export async function generateScript(topic: string): Promise<Script> {
  const prompt = `${SYSTEM_PROMPT}\n\nTopic: ${topic}\n\nReturn JSON only, no prose before or after.`;

  console.log("[script] calling claude CLI...");
  const raw = await runClaude(prompt);

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Could not find JSON in Claude response:\n${raw}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error(
      `Claude returned invalid JSON: ${(err as Error).message}\n${raw}`,
    );
  }

  const result = ScriptSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Script failed validation: ${result.error.message}\nGot: ${JSON.stringify(parsed, null, 2)}`,
    );
  }
  return result.data;
}
