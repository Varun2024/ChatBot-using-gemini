import { searchDocuments } from "@/lib/search";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body.query as string;

    if (!query) {
      return new Response("Missing query parameter", { status: 400 });
    }

    const results = await searchDocuments(query);

    return new Response(
      JSON.stringify(
        {
          query,
          resultCount: results.length,
          results: results.map((doc) => ({
            content: doc.content.substring(0, 200) + "...",
            id: doc.id,
          })),
          rawResults: results, // Full results for detailed inspection
        },
        null,
        2,
      ),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Debug search error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
