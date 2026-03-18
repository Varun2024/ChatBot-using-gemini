import { createOpenAI } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    // Recommended by OpenRouter for rankings/analytics.
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
    "X-Title": process.env.OPENROUTER_APP_NAME ?? "nextjs-chatbot",
  },
});

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { messages?: UIMessage[] }
      | null;
    const messages = body?.messages;

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response("Missing OPENROUTER_API_KEY in .env.local", {
        status: 500,
      });
    }

    if (!Array.isArray(messages)) {
      return new Response("Invalid request body: expected { messages: UIMessage[] }", {
        status: 400,
      });
    }

    const result = streamText({
      model: openrouter.chat("google/gemma-3-27b-it:free"),
      // system:
      //   "You are a helpful chat assistant. Be concise by default, ask a brief clarifying question when needed, and format answers clearly using markdown when helpful.",
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
      abortSignal: req.signal,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
