# Product Requirements Document (PRD)

## Tech Stack & Packages

The following tools and npm packages are recommended for building the basketball chatbot, mirroring the proven stack from Signal Desk:

### Core Framework
- **Next.js** (`next`, `react`, `react-dom`): App Router, API routes, SSR/SSG

### Database & Vector Search
- **Neon Postgres** (cloud Postgres, serverless)
- **pgvector**: Postgres extension for vector similarity search
- **Drizzle ORM** (`drizzle-orm`, `drizzle-kit`): Type-safe DB access and migrations

### AI/LLM Integration
- **Vercel AI SDK** (`ai`): Unified OpenAI-compatible chat/embedding API
- **@ai-sdk/openai**: Provider abstraction for OpenAI, Groq, OpenRouter, etc.
- **OpenRouter**: For embedding model API (e.g., `nvidia/llama-nemotron-embed-vl-1b-v2:free`)
- **Groq**: For fast LLM chat completions (e.g., `moonshotai/kimi-k2-instruct-0905`)

### PDF/Text Processing (if needed for ingestion)
- **pdf-parse**: For extracting text from PDF sources (if ingesting PDF rulebooks, etc.)

### Utility & Support
- **dotenv**: Environment variable management
- **zod**: Schema validation for env/config
- **lucide-react**: Icon set for UI polish
- **tailwindcss**: Utility-first CSS framework
- **postcss**, **autoprefixer**: CSS tooling

### Dev & Testing
- **typescript**: Type safety
- **eslint**, **prettier**: Linting and formatting
- **vitest** or **jest**: Unit/integration testing

### Optional (for advanced RAG)
- **bge-reranker** (self-hosted or API): For reranking retrieved chunks
- **playwright**: For end-to-end testing

### Special Notes for Basketball Data
- For ingestion, use custom scripts (Node.js) to fetch and normalize data from NBA APIs, Basketball-Reference, or other sources.
- All ingestion and chunking logic should be in `/lib/basketball/` and `/scripts/`.

**All packages above are available via npm/yarn/pnpm.**

## Project Name

CourtMind AI (Basketball Intelligence Chatbot)

## 1. Product Summary

CourtMind AI is a basketball-specialized chatbot that answers questions using a curated basketball knowledge base (rules, player stats, team history, game strategy, injuries, trades, and analytics). It will use a similar architecture to this project (Next.js + API route + vector search + LLM) but with two major differences:

- No user authentication
- No user upload flow

All data ingestion is handled offline or by scheduled jobs.

## 2. Goals and Non-Goals

### Goals

- Deliver accurate basketball-grounded answers with citations from trusted data sources
- Keep latency low for interactive chat (< 2.5s first token target)
- Reuse current stack patterns for fast implementation
- Support updates for ongoing seasons via automated data refresh

### Non-Goals

- General-purpose assistant behavior outside basketball domain
- User-specific document upload
- Multi-tenant auth/permissions

## 3. Target Users

- NBA and NCAA fans
- Fantasy basketball users
- Sports journalists and content creators
- Casual users who want quick, correct basketball explanations

## 4. User Stories

- As a fan, I want to ask "Who leads the league in assists this season?" and get a sourced answer.
- As a fantasy user, I want matchup and form context for players over recent games.
- As a beginner, I want clear explanations of basketball rules and terms.
- As an analyst, I want quick comparisons between players, teams, and eras.

## 5. Functional Requirements

1. Chat UI with streaming responses
2. Retrieval-Augmented Generation (RAG) over basketball corpus
3. Source citations in responses (doc title + URL + date)
4. Domain guardrails:
   - If question is not basketball-related, respond with a short refusal or redirect
5. Freshness tags in answers ("Data as of YYYY-MM-DD")
6. Admin-triggered or scheduled re-index job (no upload UI)
7. Debug endpoint for retrieval diagnostics

## 6. Non-Functional Requirements

- Availability: 99.5% monthly target for app API
- Latency: p95 under 4s for full answer, first token target under 2.5s
- Quality: grounded answer rate > 90% on evaluation set
- Cost control: token and embedding usage caps
- Observability: log retrieval count, top similarity, answer latency

## 7. Architecture (Similar to Current Project)

### Frontend

- Next.js App Router
- Chat page using `useChat` style pattern

### Backend

- Next.js API route for chat orchestration
- LLM provider via OpenAI-compatible SDK
- Embedding model for query and corpus chunks

### Data Layer

- Neon Postgres + pgvector
- `documents` (or `basketball_documents`) table with vector embeddings
- Cosine similarity retrieval with threshold tuning

### Pipeline

1. Ingestion workers pull data from approved basketball sources
2. Normalize and chunk content
3. Generate embeddings
4. Upsert into vector table
5. Chat route retrieves top-k context and calls LLM

## 8. Proposed Data Sources

- Official NBA stats and game logs
- Basketball-Reference style historical stats
- Team and league rulebook documentation
- Trusted sports journalism sources
- Injury reports and transaction feeds

Note: every source must be license-compliant and attributable.

## 9. Data Model (Initial)

- `basketball_documents`
  - `id`
  - `source`
  - `source_url`
  - `title`
  - `published_at`
  - `season`
  - `team`
  - `player`
  - `content`
  - `embedding` (vector)
  - `created_at`
  - `updated_at`

## 10. Retrieval Strategy

- Hybrid retrieval preferred:
  - Vector search for semantic relevance
  - Optional metadata filtering (season, team, player)
- Start defaults:
  - `topK=5`
  - `threshold=0.25-0.35` (tune using eval set)
- Re-rank top candidates before final context pack (optional v2)

## 11. How to Train the LLM on Basketball Data

There are three practical approaches, from fastest to most custom.

### Option A: RAG Only (Fastest, Recommended MVP)

What it is:
- Keep base LLM unchanged
- Inject basketball documents at inference time

Pros:
- Fast to build
- Easy to keep current with new games/stats
- Lower risk and lower cost

Cons:
- Model style remains generic
- Performance depends heavily on retrieval quality

When to use:
- MVP and early production

### Option B: Supervised Fine-Tuning (SFT) on Basketball QA

What it is:
- Create instruction dataset (`question -> ideal basketball answer`)
- Fine-tune a base model (or LoRA adapter)

Pros:
- Better basketball tone and response format
- Better handling of common basketball intents without long context

Cons:
- Requires dataset curation and eval pipeline
- Needs retraining for behavior updates

When to use:
- After MVP once query patterns stabilize

### Option C: Continued Pretraining + SFT (Most Advanced)

What it is:
- Continue pretraining on large basketball corpus, then SFT on QA

Pros:
- Best domain adaptation potential
- Strong domain vocabulary and recall

Cons:
- Highest cost/complexity
- Needs strong MLOps and careful quality controls

When to use:
- At scale when product has proven ROI

## 12. Recommended Training Path (Phased)

Phase 1: RAG MVP
- Build high-quality basketball corpus
- Add chunking, embeddings, retrieval, citations
- Add eval set (100-300 benchmark questions)

Phase 2: Hybrid Quality Upgrade
- Add query rewriting and reranking
- Add answer templates for stats, comparisons, and rule explanations
- Improve eval and observability

Phase 3: SFT
- Create 5k-50k basketball instruction-response pairs
- Fine-tune with LoRA/adapter
- Keep RAG active for freshness and citations

Phase 4: Advanced Domain Model
- Consider continued pretraining on licensed corpus
- Add preference tuning with expert-labeled answers

## 13. Training Data Requirements

For SFT dataset quality:
- Clear instruction formatting
- Grounded reference answer with source links
- Coverage across:
  - Rules and officiating
  - Team and player history
  - Current season stats
  - Tactical concepts (pick-and-roll, drop coverage, pace)
  - Injury/news impact analysis

Minimum recommended SFT starter set:
- 5,000 high-quality QA examples

## 14. Evaluation Plan

### Offline Evaluation

- Retrieval metrics: Recall@k, MRR, nDCG
- Answer metrics: groundedness, factuality, citation accuracy
- Hallucination rate by category

### Online Evaluation

- User thumbs up/down
- Answer acceptance rate
- Response latency and token cost

## 15. API Surface (Initial)

- `POST /api/chat`
  - Input: chat messages
  - Internal: retrieve + generate
  - Output: streamed answer + citations metadata

- `GET /api/health`
  - Service health and dependency checks

- `POST /api/reindex` (protected by secret token, not user auth)
  - Triggers ingestion/re-embedding jobs

- `GET /api/debug/retrieval?query=...`
  - Returns top matches and similarity scores

## 16. Security and Compliance

- Do not ingest unlicensed copyrighted content
- Keep source URL and attribution for each chunk
- Add abuse/rate limiting on public chat endpoint
- Keep secrets in environment variables only

## 17. Rollout Plan

1. Build MVP RAG chatbot with fixed corpus
2. Add citations + retrieval diagnostics
3. Add scheduled data refresh
4. Add eval dashboard
5. Decide on SFT based on quality gaps and cost-benefit

## 18. Success Criteria

- 90%+ of benchmark basketball queries answered with valid citations
- Hallucination rate below 8% on benchmark set
- Median response time under 2.5s
- Stable weekly data refresh with no manual intervention

## 19. Out of Scope for Initial Release

- Voice interface
- Personalized user memory
- Betting advice generation
- Real-time play-by-play within sub-second SLAs

## 20. Specific Models and Their Purpose

This section defines concrete model choices for the basketball project.

### A. Chat / Reasoning Model (Answer Generation)

- Primary: `moonshotai/kimi-k2-instruct-0905`
  - Purpose: main conversational and reasoning model for basketball Q&A
  - Why: strong instruction-following and long-context handling for RAG prompts

- Fallback 1: `meta-llama/llama-3.1-8b-instruct`
  - Purpose: fallback generation when primary model is unavailable or rate-limited
  - Why: reliable, lower latency, good cost/performance for production fallback

- Fallback 2: `mistralai/mistral-7b-instruct`
  - Purpose: secondary safety fallback for high availability
  - Why: robust instruction model with broad provider support

### B. Embedding Model (Retrieval Index + Query Embeddings)

- Primary: `nvidia/llama-nemotron-embed-vl-1b-v2:free`
  - Purpose: generate embeddings for both corpus chunks and user queries
  - Why: already validated in current architecture with pgvector setup
  - Notes: normalize vectors to configured DB dimension (currently 2000)

- Fallback: `text-embedding-3-small` (if moving to OpenAI embeddings)
  - Purpose: backup embedding generation path
  - Why: high reliability and stable API behavior

### C. Optional Re-Ranker (V2)

- Candidate: `bge-reranker-large` (self-hosted or API provider)
  - Purpose: rerank top retrieved chunks before final context packing
  - Why: improves answer groundedness when many semantically similar chunks exist

### D. Model Routing Policy

1. Try primary chat model.
2. On provider 429/5xx, automatically retry with fallback model.
3. Keep embedding model fixed for index consistency.
4. Re-embed corpus only when embedding model changes.

## 21. Implementation Blueprint

This is the execution plan to build the basketball chatbot using the same architecture style as this project.

### Phase 0: Project Setup (Day 1)

Deliverables:
- Clone current app baseline
- Remove auth and upload UI/routes
- Keep chat route, vector DB, and streaming response pattern

Tasks:
1. Remove auth middleware and auth UI components.
2. Remove PDF upload pages/actions.
3. Keep `app/chat` and create a basketball-focused home page.
4. Add env schema for model keys and routing config.

### Phase 1: Data Foundation (Days 2-4)

Deliverables:
- Basketball corpus tables and ingestion jobs
- First indexed dataset (rules + players + teams + recent season summaries)

Tasks:
1. Create `basketball_documents` table with metadata columns.
2. Build ingestion scripts:
   - fetch source data
   - normalize text
   - chunk content
   - generate embeddings
   - upsert rows
3. Add deduping by `source_url + content_hash`.
4. Add scheduled reindex job (daily/weekly).

### Phase 2: RAG Chat Backend (Days 5-6)

Deliverables:
- Production `POST /api/chat` with citations and model fallback

Tasks:
1. Retrieve top-k chunks using vector similarity.
2. Add metadata filters (`season`, `team`, `player`) when inferred from query.
3. Inject context with strict grounding instruction.
4. Return structured citation metadata with each response.
5. Add fallback routing for chat model provider failures.

### Phase 3: Frontend Experience (Days 7-8)

Deliverables:
- Basketball chatbot UI with source cards and freshness labels

Tasks:
1. Build chat UI with streaming tokens.
2. Show citations per answer:
   - source title
   - source URL
   - published date
3. Add "Data as of" freshness indicator.
4. Add domain guardrail messaging for non-basketball queries.

### Phase 4: Observability and Eval (Days 9-10)

Deliverables:
- Retrieval diagnostics and quality benchmark

Tasks:
1. Add `GET /api/debug/retrieval?query=...`.
2. Log retrieval metrics:
   - match count
   - top similarity
   - latency
3. Create benchmark set (100-300 basketball questions).
4. Track groundedness and hallucination metrics.

### Phase 5: Hardening and Launch (Days 11-12)

Deliverables:
- Public-ready MVP

Tasks:
1. Add rate limiting and abuse controls.
2. Add graceful error handling for model downtime.
3. Add health checks and smoke tests.
4. Deploy and validate production telemetry.

### Suggested Repository Structure

```text
app/
  page.tsx
  chat/page.tsx
  api/
    chat/route.ts
    health/route.ts
    debug/retrieval/route.ts
    reindex/route.ts
lib/
  db-config.ts
  db-schema.ts
  chunking.ts
  embeddings.ts
  search.ts
  basketball/
    ingest.ts
    normalize.ts
    sources.ts
scripts/
  ingest-basketball.ts
  eval-basketball.ts
```

### Technical Blueprint Notes

- Keep RAG as the primary grounding mechanism.
- Add SFT only after retrieval quality plateaus.
- Keep provider abstraction in one place to avoid lock-in.
- Preserve compatibility with OpenAI-style SDK interfaces.
