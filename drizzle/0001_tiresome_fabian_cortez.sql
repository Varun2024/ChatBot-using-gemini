CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"emdeddings" vector(1536)
);
--> statement-breakpoint
CREATE INDEX "embeddingsIndex" ON "documents" USING hnsw ("emdeddings" vector_cosine_ops);