# RAG Notes (Concepts Used in This App)

This document is a **notes-only knowledge base** listing concepts, terms, and implementation patterns used in this codebase. It’s intended to be embedded/indexed later for **RAG (Retrieval-Augmented Generation)**.

## Tools Used (Complete Stack)

### Core app framework

- **Next.js 16 (App Router)**: routing, server/client component split, route handlers.
- **React 19** + **React DOM 19**: UI rendering and hooks.
- **TypeScript 5**: static typing across app/API/UI layers.

### LLM + AI stack

- **Vercel AI SDK (`ai`)**: `streamText`, `embed`, `embedMany`, UI/model message conversions.
- **AI SDK React (`@ai-sdk/react`)**: `useChat()` client chat state + streaming helpers.
- **AI SDK OpenAI provider (`@ai-sdk/openai`)**: OpenAI-compatible provider client, used with OpenRouter base URL.
- **OpenRouter API**: model routing for chat and embeddings.
- **OpenAI SDK (`openai`)**: available in dependencies for OpenAI-compatible integrations.
- **Zod (`zod`)**: validation and schema-based type safety.

### RAG + data pipeline tools

- **Drizzle ORM (`drizzle-orm`)**: schema definitions and typed DB queries.
- **Drizzle Kit (`drizzle-kit`)**: SQL migration generation and schema management.
- **Neon serverless driver (`@neondatabase/serverless`)**: Postgres connectivity.
- **pgvector extension (Postgres extension)**: vector column type and ANN search support.
- **LangChain text splitters (`@langchain/textsplitters`)**: document chunking utility.
- **PDF parsing (`pdf-parse`, `@types/pdf-parse`)**: PDF ingestion support.
- **dotenv**: loading `.env.local` values in tooling config (e.g., `drizzle.config.ts`).

### Auth and access control

- **Clerk (`@clerk/nextjs`)**: authentication UI, middleware protection, signed-in/signed-out flows.

### UI system and component libraries

- **Tailwind CSS v4 (`tailwindcss`)**: utility-first styling.
- **PostCSS Tailwind plugin (`@tailwindcss/postcss`)**: Tailwind processing in build pipeline.
- **tw-animate-css**: animation utility presets.
- **shadcn CLI + patterns (`shadcn`)**: component scaffolding and structure.
- **Radix ecosystem (`radix-ui`, `@radix-ui/react-use-controllable-state`)**: primitives and state helpers.
- **Base UI (`@base-ui/react`)**: composable primitives used by AI elements.
- **class-variance-authority + clsx + tailwind-merge**: class composition and variant systems.
- **lucide-react**: icon set.
- **motion**: animations and transitions.
- **sonner**: toast notifications.
- **next-themes**: theme toggling.

### AI rich rendering / interaction components

- **streamdown + plugins (`@streamdown/code`, `@streamdown/math`, `@streamdown/mermaid`, `@streamdown/cjk`)**:
  markdown streaming renderer with code/math/diagram support.
- **use-stick-to-bottom**: sticky scroll behavior for chat streams.
- **media-chrome**: media controls.
- **@xyflow/react**: node/graph-style visual UI primitives.

### Supporting UI utilities

- **cmdk**: command menu interactions.
- **date-fns**: date handling.
- **embla-carousel-react**: carousel.
- **input-otp**: OTP input patterns.
- **recharts**: charting.
- **react-day-picker**: calendar/date UI.
- **react-resizable-panels**: split panels.
- **vaul**: drawer UI.
- **ansi-to-react**, **react-jsx-parser**, **shiki**, **tokenlens**, **nanoid**: rendering/helpers/utilities.

### Dev quality and workflow

- **ESLint 9 + `eslint-config-next`**: linting and Next.js best practices.
- **npm scripts**:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
- **Git + GitHub**: source control and remote collaboration.

## Development Process (Detailed)

### 1) Plan and define scope

1. Define the user-facing behavior first: chat flow, auth boundaries, and RAG goal.
2. Decide baseline model provider and fallback plan (OpenRouter model IDs and rate-limit behavior).
3. Confirm environment variables and secrets strategy before coding.

### 2) Project setup and dependency installation

1. Bootstrap Next.js App Router project.
2. Install core app dependencies (React/Next/TypeScript/Tailwind).
3. Add AI stack (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`) and auth (`@clerk/nextjs`).
4. Add RAG/data stack (`drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, splitters, pdf parser).
5. Add UI libraries for chat ergonomics and rich rendering.

### 3) Configure environment and external services

1. Create `.env.local` with keys like `OPENROUTER_API_KEY`, `NEON_DATABASE_URL`, Clerk keys.
2. Configure provider base URL and headers for OpenRouter.
3. Verify secrets are never hardcoded in source files.

### 4) Build authentication and route protection

1. Wrap app with `ClerkProvider` in root layout.
2. Add root-level middleware with allowlist/protected route matchers.
3. Validate signed-in/signed-out UI and protected API/page behavior.

### 5) Build chat API route

1. Implement `POST` route in `app/api/chat/route.ts`.
2. Parse and validate request body (`messages` shape).
3. Convert UI messages to model messages with AI SDK helpers.
4. Stream model output with `streamText(...).toUIMessageStreamResponse()`.
5. Add error responses for missing env vars and provider failures.
6. For OpenRouter compatibility, prefer chat-completions mode when needed.

### 6) Build chat UI

1. Implement client chat page (`useChat`).
2. Render messages by part type; guard against undefined interim parts.
3. Add clear input/submit/stop controls and loading/error states.
4. Keep the conversation area scrollable and composer fixed in a reliable layout.
5. Add attachments/voice/sources UI progressively.

### 7) Implement RAG data layer

1. Define schema and vector column in Drizzle (`vector(...)`).
2. Enable `pgvector` extension in migration SQL.
3. Create HNSW index with cosine operator class.
4. Add embedding helper functions for single and batch text.
5. Add chunking path (e.g., split long docs to retrieval-friendly segments).

### 8) Implement ingestion pipeline

1. Read source docs (text/PDF/etc.).
2. Clean and normalize text.
3. Chunk text with deterministic boundaries.
4. Generate embeddings.
5. Insert chunk + embedding rows into `documents` table.
6. Add idempotency strategy (re-ingestion updates vs duplicate rows).

### 9) Implement retrieval + answer grounding

1. Embed user query at request time.
2. Run vector similarity search (`top-k`) on pgvector.
3. Build context block from top chunks.
4. Inject context into system/developer/user prompt safely.
5. Stream final grounded answer to UI.
6. Optionally show source snippets/citations in response UI.

### 10) Debugging and compatibility hardening

1. Reproduce API failures via direct `POST /api/chat` calls.
2. Check runtime logs for provider-specific errors.
3. Validate model ID availability on provider.
4. Confirm multi-turn payload compatibility (first-turn vs follow-up-turn behavior).
5. Add graceful fallbacks for rate-limit (429), provider outages, and invalid payload errors.

### 11) QA and validation checklist

1. Lint/type check passes.
2. Chat first-turn and follow-up-turn both succeed.
3. Streaming state and stop button work.
4. Error states are visible and actionable.
5. Auth guards and public routes work as intended.
6. Vector DB migration and retrieval return expected top chunks.

### 12) Release workflow

1. Stage changes with meaningful commits.
2. Push to remote branch.
3. Validate deployment environment variables.
4. Smoke-test production chat + auth + retrieval.

### 13) Ongoing improvement loop

1. Monitor latency, error rate, and rate-limit frequency.
2. Improve chunking strategy and retrieval ranking.
3. Add caching for repeated queries and embeddings.
4. Expand citation UX and observability.
5. Regularly rotate keys and audit secrets exposure.

## App & Framework

- **Next.js (App Router)**: `app/` directory routing, React Server Components by default, nested layouts.
- **Route Handlers**: API endpoints implemented as `app/api/**/route.ts` exporting HTTP methods like `POST`.
- **Client Components**: `\"use client\"` for interactive pages/components (hooks, browser-only APIs).
- **Environment Variables**: `process.env.*` for secrets/config (e.g. `OPENROUTER_API_KEY`), typically stored in `.env.local`.

## Authentication (Clerk)

- **ClerkProvider**: wraps the app in `app/layout.tsx` to provide auth context.
- **Clerk Middleware (Next.js middleware)**:
  - Must be located at **project root** as `middleware.ts` (not inside a subfolder) for Next.js + Clerk detection.
  - Uses `clerkMiddleware(async (auth, req) => ...)` with `createRouteMatcher(...)` to allow some routes publicly and protect the rest via `auth.protect()`.
  - **matcher config** controls which paths the middleware runs on (pages + API routes, excluding Next.js internals/static files).
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
  - Currently set in `app/api/chat/route.ts` to `google/gemma-3-4b-it:free` (OpenRouter free model).

## Streaming Reliability & Rate Limits

- **HTTP 429 rate limit**:
  - Common with `:free` models (shared capacity; upstream provider throttling).
  - OpenRouter may route to different upstream providers; rate limits can be upstream-specific.
- **Abort/cancel streaming**:
  - Pass `abortSignal: req.signal` so server-side generation stops when the client disconnects.

## Prompting / Output Control

- **System instruction**:
  - `system` prompt used to steer assistant style (concise, clarifying questions, markdown formatting).
  - In the current `app/api/chat/route.ts`, the `system` prompt is commented out (so the model relies on the chat history/messages).
  - Note: some models/providers may reject system/developer instructions (e.g. “Developer instruction is not enabled…”).
- **Sampling parameters**:
  - `temperature`: randomness/creativity.
  - `topP`: nucleus sampling cutoff.
  - `maxOutputTokens`: cap response length.

## Vector Store & Document DB (Drizzle + pgvector)

- **Vector-enabled Postgres**:
  - Migration uses `CREATE EXTENSION IF NOT EXISTS vector` (pgvector).
- **documents table as RAG corpus**:
  - `documents.content`: raw text content.
  - `documents.emdeddings`: embedding vector with **1536** dimensions (pgvector `vector(1536)`).
  - `embeddingsIndex`: HNSW index using `vector_cosine_ops` for cosine similarity search.
- **Drizzle ORM + Neon**:
  - `drizzle.config.ts` uses dialect `postgresql` with `NEON_DATABASE_URL`.
  - `lib/db-config.ts` connects via `@neondatabase/serverless` + `drizzle-orm/neon-http`.
  - `lib/db-schema.ts` defines the `documents` table and vector index opclass (`vector_cosine_ops`).
- **Note about RAG completeness**:
  - This repo includes the **vector schema/migrations** and an **embeddings helper** (`lib/embeddings.ts`), but the current `/api/chat` endpoint does not yet perform embeddings generation + retrieval against `documents`.
  - In other words: you have the database/index scaffolding, but the end-to-end “retrieve relevant chunks, then answer with them” flow is not wired into the chat endpoint yet.

## Chat UI Capabilities (Attachments, Sources, Voice)

- **Attachments & screenshots**:
  - `PromptInput` supports file attachments and actions like taking screenshots (browser capture + `canvas`).
  - Attachments get converted when needed (e.g., blob URLs -> data URLs).
- **Referenced sources / inline citations**:
  - UI types include `SourceDocumentUIPart` and rendering components for inline citations/sources.
- **Voice input**:
  - `SpeechInput` uses Web Speech API when available, with fallback to `MediaRecorder` for browsers that don’t support speech recognition.
  - `transcription` UI renders transcription segments.
- **Message rendering**:
  - `MessageResponse` uses `streamdown` plugins (e.g., `code`, `math`, `mermaid`, `cjk`) to render rich outputs.

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
  - Provider-side `429` rate limits may surface to the client as an error message (depends on how the AI SDK propagates errors).
- **Client error display**:
  - Render error message in chat UI when `useChat()` reports an error.

## Files to Look At (Entry Points)

- **Home**: `app/page.tsx`
- **Chat UI**: `app/chat/page.tsx`
- **Chat API**: `app/api/chat/route.ts`
- **Vector DB config**: `drizzle.config.ts`, `lib/db-config.ts`, `lib/db-schema.ts`
- **Vector DB migrations**: `drizzle/*.sql`
- **Navigation**: `components/navigation.tsx`
- **Auth wrapper**: `app/layout.tsx`
- **Middleware**: `middleware.ts`

## Suggested RAG Tags / Keywords

- **nextjs**: app router, route handler, middleware, server components, client components
- **auth**: clerk, ClerkProvider, clerkMiddleware, createRouteMatcher, auth.protect, matcher, signed-in signed-out
- **llm**: openrouter, gemma-3-4b-it, streaming, Vercel AI SDK, useChat, streamText, convertToModelMessages
- **reliability**: 429 rate limit, abort signal, provider error propagation
- **rag/db**: rag scaffold, pgvector, vector(1536), hnsw, cosine similarity, documents table, drizzle, neon, drizzle-kit migrations
- **embeddings**: embed, embedMany, embedding model, dimensionality match, vector(1536)
- **ui**: tailwind, prompt-input, attachments, screenshots, speech recognition, mediarecorder fallback, inline citations, streamdown, button component

## Study / Revision Guide (How To Learn This App’s RAG Concepts)

### 1) The RAG mental model (5 steps)

1. **Document ingestion**: take raw text you want the assistant to know about.
2. **Chunking** (optional but recommended): split long text into passages.
3. **Embedding**: convert each passage into a numeric vector using an embedding model.
4. **Indexing**: store vectors in a vector database (here: **Postgres + pgvector**).
5. **Retrieval + generation**:
   - retrieve the most relevant stored vectors for a user question (vector similarity),
   - then call the chat model with those retrieved passages as context.

### 2) What exists in THIS repo (map from steps to code)

#### Ingestion / embeddings

- `lib/embeddings.ts` defines:
  - `generateEmbedding(text)` and `generateEmbeddings(text[])` using the AI SDK `embed` / `embedMany`.
  - It currently uses `openai.textEmbeddingModel("...")` (AI SDK OpenAI embedding adapter), not OpenRouter.
- The DB schema expects a pgvector column: `documents.emdeddings` = `vector(1536)`.
- Revision focus: **embedding dimensionality must match the DB column**.

#### Indexing / vector DB

- `drizzle/*.sql`, `drizzle.config.ts`, `lib/db-config.ts`, `lib/db-schema.ts` define:
  - `CREATE EXTENSION vector`
  - `documents(content text, emdeddings vector(1536))`
  - an HNSW index: `embeddingsIndex` using `vector_cosine_ops`

#### Retrieval + answer generation

- `app/api/chat/route.ts` currently:
  - only streams a chat completion (`streamText(...).toUIMessageStreamResponse()`),
  - does not yet query `documents` or inject retrieved passages into the prompt.

#### UI / interaction

- `app/chat/page.tsx` uses `useChat()` to send/receive messages and stream the assistant output.
- The UI also supports advanced input types (attachments, screenshot capture, voice) and UI concepts for “referenced sources”.

### 3) Key concepts to revise (with “what to look for”)

#### Vector embeddings

- Definition: embedding = fixed-size numeric representation of text meaning.
- In code: `lib/embeddings.ts` (`embed` / `embedMany`).
- Revision question: do your embedding dims match `vector(1536)`?

#### pgvector + similarity

- Definition: a vector column plus an index to efficiently find nearest vectors.
- In code:
  - `CREATE EXTENSION IF NOT EXISTS vector`
  - `vector_cosine_ops` + HNSW index
- Revision question: are you using cosine similarity consistently for both query and indexing?

#### Indexing strategy

- Definition: what you store (whole docs vs chunks).
- In code today: you store `content` + `emdeddings`; there is no chunking/insertion pipeline shown yet.

#### Prompt augmentation (the RAG “glue”)

- Definition: retrieved passages get inserted into the prompt before answering.
- In code today: not implemented in `/api/chat`.

#### Streaming + cancellation

- Definition: server streams tokens to the client; abort stops generation.
- In code: `abortSignal: req.signal` in `/api/chat`.

### 4) Self-test questions (answer these before you implement retrieval)

1. What file defines the **vector schema** and index, and what is the vector dimension?
2. Which function in `lib/embeddings.ts` should you use to likely match the `vector(1536)` schema?
3. Where should “retrieve top-K passages” happen before calling the chat model?
4. How would you insert retrieved `documents.content` into the messages/prompt for the chat model?
5. What happens to the user experience when the embedding provider rate-limits (429)?
