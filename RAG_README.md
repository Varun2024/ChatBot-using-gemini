# RAG Notes (Concepts Used in This App)

This document is a **notes-only knowledge base** listing concepts, terms, and implementation patterns used in this codebase. It’s intended to be embedded/indexed later for **RAG (Retrieval-Augmented Generation)**.

## App & Framework
- **Next.js (App Router)**: `app/` directory routing, React Server Components by default, nested layouts.
- **Route Handlers**: API endpoints implemented as `app/api/**/route.ts` exporting HTTP methods like `POST`.
- **Client Components**: `\"use client\"` for interactive pages/components (hooks, browser-only APIs).
- **Environment Variables**: `process.env.*` for secrets/config (e.g. `OPENROUTER_API_KEY`), typically stored in `.env.local`.

## Authentication (Clerk)
- **ClerkProvider**: wraps the app in `app/layout.tsx` to provide auth context.
- **Clerk Middleware (Next.js middleware)**:
  - Must be located at **project root** as `middleware.ts` (not inside a subfolder) for Next.js + Clerk detection.
  - Uses `clerkMiddleware()` to attach auth/session handling to requests.
  - **matcher config** controls which routes the middleware runs on (pages + API routes).
- **Signed-in / Signed-out UI**:
  - `Show when=\"signed-in\"` and `Show when=\"signed-out\"` (Clerk UI helper).
  - `SignInButton`, `SignUpButton`, `SignOutButton`, `UserButton`.

## Chat (Vercel AI SDK + OpenRouter)
- **Vercel AI SDK**:
  - `streamText()` for streaming model output.
  - `useChat()` on the client to send messages and receive streaming responses.
  - Message formats: `UIMessage` (client/UI) and conversion to model messages via `convertToModelMessages()`.
  - Streaming response helper: `toUIMessageStreamResponse()`.
- **OpenRouter**:
  - OpenAI-compatible API endpoint: `https://openrouter.ai/api/v1`.
  - Provider client: `createOpenAI({ baseURL, apiKey, headers })`.
  - OpenRouter headers:
    - `HTTP-Referer` and `X-Title` (recommended for analytics/rankings).
- **Model selection**:
  - Primary model (example): `qwen/qwen3-next-80b-a3b-instruct:free`.
  - Fallback list (comma-separated env var): `OPENROUTER_FALLBACK_MODELS`.

## Streaming Reliability & Rate Limits
- **HTTP 429 rate limit**:
  - Common with `:free` models (shared capacity; upstream provider throttling).
  - OpenRouter may route to different upstream providers; rate limits can be upstream-specific.
- **Retry with exponential backoff**:
  - Pattern: retry a few times after 429 with increasing delays (e.g. 500ms → 1500ms → 3000ms).
- **Fallback models**:
  - If primary model returns 429 repeatedly, try another free model.
- **Abort/cancel streaming**:
  - Pass `abortSignal: req.signal` so server-side generation stops when the client disconnects.

## Prompting / Output Control
- **System instruction**:
  - `system` prompt used to steer assistant style (concise, clarifying questions, markdown formatting).
  - Note: some models/providers may reject system/developer instructions (e.g. “Developer instruction is not enabled…”).
- **Sampling parameters**:
  - `temperature`: randomness/creativity.
  - `topP`: nucleus sampling cutoff.
  - `maxOutputTokens`: cap response length.

## UI & Styling
- **Tailwind CSS**: utility-first styling across pages/components.
- **Component patterns**:
  - Reusable UI components (e.g. `components/ui/button.tsx`).
  - Shadcn-like patterns: `class-variance-authority (cva)` for variants/sizes, `cn()` utility.
- **Layout structure**:
  - Global navigation in `components/navigation.tsx`.
  - Page layout uses container/max-width patterns (`container mx-auto`, `max-w-*`).

## Error Handling Patterns
- **Input validation** (API):
  - Validate JSON body shape (expect `{ messages: UIMessage[] }`), return 400 on invalid input.
- **Server error responses**:
  - Return 500 for unexpected failures.
  - Return 429 when all free models are temporarily rate-limited.
- **Client error display**:
  - Render error message in chat UI when `useChat()` reports an error.

## Files to Look At (Entry Points)
- **Home**: `app/page.tsx`
- **Chat UI**: `app/chat/page.tsx`
- **Chat API**: `app/api/chat/route.ts`
- **Navigation**: `components/navigation.tsx`
- **Auth wrapper**: `app/layout.tsx`
- **Middleware**: `middleware.ts`

## Suggested RAG Tags / Keywords
- **nextjs**: app router, route handler, middleware, server components, client components
- **auth**: clerk, ClerkProvider, clerkMiddleware, matcher, signed-in signed-out
- **llm**: openrouter, qwen, streaming, Vercel AI SDK, useChat, streamText
- **reliability**: 429 rate limit, retry, exponential backoff, fallback models, abort signal
- **ui**: tailwind, cva, variants, shadcn ui, button component

