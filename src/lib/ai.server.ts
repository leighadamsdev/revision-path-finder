/**
 * Lovable AI Gateway helper (server-only).
 * Uses the Responses API with streaming, as reasoning runs can take minutes.
 */

type JsonSchema = Record<string, unknown>;

type InputPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string }
  | { type: "input_file"; filename: string; file_data: string };

export type AiInput = Array<{ role: "user"; content: InputPart[] }>;

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function askForJson<T>(options: {
  input: AiInput;
  schemaName: string;
  schema: JsonSchema;
  instructions: string;
  signal?: AbortSignal;
}): Promise<T> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError("AI is not configured for this app yet.", 401);

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    ...(options.signal ? { signal: options.signal } : {}),
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions: options.instructions,
      input: options.input,
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      text: {
        format: {
          type: "json_schema",
          name: options.schemaName,
          strict: true,
          schema: options.schema,
        },
      },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new AiError(friendlyError(res.status, detail), res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      let event: Record<string, unknown>;
      try {
        event = JSON.parse(payload) as Record<string, unknown>;
      } catch {
        continue;
      }
      if (event["type"] === "response.output_text.delta" && typeof event["delta"] === "string") {
        text += event["delta"];
      }
      if (event["type"] === "response.completed") {
        const response = event["response"] as { output_text?: string } | undefined;
        if (!text && typeof response?.output_text === "string") text = response.output_text;
      }
    }
  }

  if (!text.trim()) throw new AiError("The AI didn't return anything usable. Try again.", 502);

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiError("The AI response couldn't be read.", 502);
  }
}

function friendlyError(status: number, detail: string) {
  if (status === 402) return "This app has run out of AI credits.";
  if (status === 429) return "The AI is busy right now — try again in a moment.";
  if (status === 403) return "AI access is currently blocked for this app.";
  console.error("AI gateway error", status, detail.slice(0, 500));
  return "The AI couldn't be reached right now.";
}
