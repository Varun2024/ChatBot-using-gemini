import { createOpenAI } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Free embedding model on OpenRouter.
const EMBEDDING_MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free";
const VECTOR_DIMENSION = 2000;

function normalizeEmbeddingDimension(embedding: number[]) {
  return embedding.slice(0, VECTOR_DIMENSION);
}

export async function generateEmbedding(text:string){
    const input = text.replace(/\n/g, " ")

    const { embedding } = await embed({
        model: openrouter.embeddingModel(EMBEDDING_MODEL),
        value:input,
    })

    return normalizeEmbeddingDimension(embedding)
}

export async function generateEmbeddings(text:string[]){
    const inputs = text.map((text)=>text.replace(/\n/g, " "))

    const {embeddings} = await embedMany({
        model: openrouter.embeddingModel(EMBEDDING_MODEL),
        values:inputs,
    })
    return embeddings.map(normalizeEmbeddingDimension)
}