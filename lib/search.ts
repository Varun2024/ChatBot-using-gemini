import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { db } from "./db-config";
import { documents, SelectDocument } from "./db-schema";
import { generateEmbedding } from "./embeddings";

// heart of the search functionality, takes a query and returns similar documents based on cosine similarity of embeddingsf
export async function searchDocuments(
    query: string,
    limit: number = 5,
    threshold: number = 0.25
) {
    const queryEmbedding = await generateEmbedding(query);
    // Calculate cosine similarity and filter results based on threshold
    const similarity =sql<number> `1-(${cosineDistance(documents.emdeddings, queryEmbedding)})`;

    // Select documents with similarity above the threshold, ordered by similarity
    const similarDocuments = await db.select({
        id: documents.id,
        content: documents.content,
        similarity,
    })
    .from(documents)
    .where(gt(similarity, threshold))
    .orderBy(desc(similarity))
    .limit(limit);

    return similarDocuments;
}