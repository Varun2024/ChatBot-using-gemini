import { pgTable, serial,text,vector,index } from "drizzle-orm/pg-core";

export const documents = pgTable("documents",{
    id: serial("id").primaryKey(),//auto incrementing id
    content:text("content").notNull(),//content of the document
    emdeddings:vector("emdeddings",{dimensions:2000}),//vector of the document

},(table)=>[
    index("embeddingsIndex").using(
        'hnsw',
        table.emdeddings.op('vector_cosine_ops')
    ),
])

// Types for the documents table
export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;