"use server"

import { PDFParse } from "pdf-parse"
import {db} from "@/lib/db-config"
import { documents } from "@/lib/db-schema"
import { generateEmbeddings } from "@/lib/embeddings"
import { chunkContent } from "@/lib/chunking"

export async function processPDFile(formData: FormData){
    try{
        const file = formData.get("pdf") as File

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const parser = new PDFParse({ data: buffer })
        const data = await parser.getText()
        await parser.destroy()

        if (!data.text || data.text.trim().length === 0 ){
            return{
                success:false,
                error:"No text found in PDF",
            }
        }

        const chunks =  await chunkContent(data.text)
        const embeddings = await generateEmbeddings(chunks)
        
            if (embeddings.length !== chunks.length) {
                return {
                    success: false,
                    error: `Embedding count mismatch: got ${embeddings.length}, expected ${chunks.length}`,
                }
            }

        // array of records containng each text with its own embeddings
        const records = chunks.map((chunk,index)=>({
            content : chunk,
            emdeddings: embeddings[index],
        }))

        await db.insert(documents).values(records)

        return{
            success: true,
            message: `created ${records.length} searchable chunks`
        }

    }catch(error){
        console.error("Pdf processing error",error)
        return {
            success: false,
            error: "failed to process PDF",
        }
    }
}