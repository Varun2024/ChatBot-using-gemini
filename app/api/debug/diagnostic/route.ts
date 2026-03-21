import { cosineDistance, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db-config";
import { documents } from "@/lib/db-schema";
import { generateEmbedding } from "@/lib/embeddings";

async function runDiagnostic(query: string) {
  try {

    console.log(`\n=== RAG Diagnostic for: "${query}" ===`);

    // Step 1: Check document count
    const allDocs = await db.select().from(documents);
    console.log(`Total documents in DB: ${allDocs.length}`);
    console.log(
      `Documents with embeddings: ${allDocs.filter((d) => d.emdeddings?.length).length}`,
    );
    console.log(
      `Documents without embeddings: ${allDocs.filter((d) => !d.emdeddings?.length).length}`,
    );

    if (allDocs.length === 0) {
      return new Response(
        JSON.stringify({
          status: "EMPTY_DB",
          message: "No documents in database. Did you upload a PDF?",
          totalDocuments: 0,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // Step 2: Generate query embedding
    let queryEmbedding;
    try {
      queryEmbedding = await generateEmbedding(query);
      console.log(
        `Query embedding generated: ${queryEmbedding.length} dimensions`,
      );
    } catch (error) {
      console.error("Failed to generate query embedding:", error);
      return new Response(
        JSON.stringify({
          status: "EMBEDDING_FAILED",
          message: "Could not generate embedding for query",
          error: String(error),
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // Step 3: Search with threshold 0 to see ALL similarity scores
    const allResults = await db
      .select({
        id: documents.id,
        content: documents.content,
        similarity: sql<number>`1-(${cosineDistance(documents.emdeddings, queryEmbedding)})`,
      })
      .from(documents)
      .orderBy(
        desc(
          sql<number>`1-(${cosineDistance(documents.emdeddings, queryEmbedding)})`,
        ),
      )
      .limit(10);

    console.log(`Results with threshold 0.0:`);
    allResults.forEach((r, i) => {
      console.log(`  ${i + 1}. Similarity: ${r.similarity.toFixed(4)}`);
      console.log(`     Content preview: ${r.content.substring(0, 80)}...`);
    });

    // Step 4: Show threshold filtering
    const results_0_5 = allResults.filter((r) => r.similarity > 0.5).length;
    const results_0_3 = allResults.filter((r) => r.similarity > 0.3).length;
    const results_0_2 = allResults.filter((r) => r.similarity > 0.2).length;

    console.log(`\nThreshold filtering results:`);
    console.log(`  > 0.5: ${results_0_5} documents`);
    console.log(`  > 0.3: ${results_0_3} documents`);
    console.log(`  > 0.2: ${results_0_2} documents`);

    return {
      query,
      status: allResults.length > 0 ? "OK" : "NO_MATCHES",
      stats: {
        totalDocuments: allDocs.length,
        documentsWithEmbeddings: allDocs.filter(
          (d) => d.emdeddings?.length,
        ).length,
        queryEmbeddingDim: queryEmbedding.length,
      },
      thresholdResults: {
        "0.5": results_0_5,
        "0.3": results_0_3,
        "0.2": results_0_2,
      },
      topMatches: allResults.slice(0, 5).map((r) => ({
        similarity: parseFloat(r.similarity.toFixed(4)),
        preview: r.content.substring(0, 150),
      })),
    };
  } catch (error) {
    console.error("Diagnostic error:", error);
    return {
      status: "ERROR",
      error: String(error),
    };
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query") || "what is the title of project";
  
  const result = await runDiagnostic(query);
  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const query = body.query as string;

  if (!query) {
    return new Response("Missing query parameter", { status: 400 });
  }

  const result = await runDiagnostic(query);
  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
