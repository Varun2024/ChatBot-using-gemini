import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { searchDocuments } from "@/lib/search";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    // Recommended by OpenRouter for rankings/analytics.
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
    "X-Title": process.env.OPENROUTER_APP_NAME ?? "nextjs-chatbot",
  },
});

export type ChatMessage = UIMessage;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as {
      messages?: ChatMessage[];
    } | null;
    const messages = body?.messages;

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response("Missing OPENROUTER_API_KEY in .env.local", {
        status: 500,
      });
    }

    if (!Array.isArray(messages)) {
      return new Response(
        "Invalid request body: expected { messages: ChatMessage[] }",
        {
          status: 400,
        },
      );
    }

    // Extract the last user message for context search
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");

    let systemPrompt =
      "You are a helpful chat assistant. Be concise by default, ask a brief clarifying question when needed, and format answers clearly using markdown when helpful.";

    // Search knowledge base for relevant context
    if (lastUserMessage && typeof lastUserMessage.content === "string") {
      try {
        const relevantDocs = await searchDocuments(lastUserMessage.content);
        if (relevantDocs.length > 0) {
          const contextText = relevantDocs
            .map((doc, index) => `[Document ${index + 1}]\n${doc.content}`)
            .join("\n\n---\n\n");
          systemPrompt += `\n\nYou have access to the following knowledge base information:\n\n${contextText}\n\nUse this information to provide accurate and helpful answers to the user's questions.`;
        }
      } catch (error) {
        console.error("Error searching documents:", error);
        // Continue without context if search fails
      }
    }

    const result = streamText({
      model: openrouter.chat("meta-llama/llama-3.2-3b-instruct:free"),
      system: systemPrompt,
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
