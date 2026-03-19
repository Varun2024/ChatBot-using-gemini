"use client";

import { useState } from "react";
import { processPDFile } from "./action";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Check, X } from "lucide-react";
import Link from "next/link";

export default function PDFUpload() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setMessage(null);

        try{
            const formData = new FormData();
            formData.append("pdf", file);

            const result = await processPDFile(formData);

            if (result.success) {
                setMessage({
                    type: "success",
                    text: result.message || "PDF file processed successfully!",
                });
                e.target.value = ""; // Reset the file input
            } else {
                setMessage({
                    type: "error",
                    text: result.error || "Failed to process the PDF file.",
                });
                e.target.value = ""; // Reset the file input
            }
        }catch{
            setMessage({
                type: "error",
                text: "Failed to process the PDF file. Please try again.",
            });
            e.target.value = ""; // Reset the file input
        }finally{
            setIsLoading(false);
        }
    }

    return (
        <div className="enter-fade min-h-[calc(100vh-4rem)] bg-stone-50 px-4 py-10 sm:px-6">
            <div className="mx-auto w-full max-w-2xl">
                <div className="enter-fade mb-10">
                    <h1 className="mb-2 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                            Add documents
                    </h1>
                    <p className="max-w-lg text-base text-stone-600">
                        Drop PDFs, then ask naturally in chat.
                    </p>
                </div>

                <Card className="enter-fade-delay border border-black/10 bg-white shadow-sm">
                    <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div>
                                    <div className="relative">
                                        <input
                                            id="pdf-upload"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                            disabled={isLoading}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="pdf-upload"
                                            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 px-6 py-14 transition-all duration-200 hover:border-black hover:bg-stone-50"
                                        >
                                            <span className="text-lg font-medium text-stone-900">Drop PDF or click</span>
                                            <span className="mt-1 text-sm text-stone-500">Supports PDF up to 10MB</span>
                                        </label>
                                    </div>
                                </div>

                                {isLoading && (
                                    <div className="flex items-center justify-center gap-3 rounded-xl border border-black/10 bg-stone-50 p-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-stone-700" />
                                        <span className="text-sm font-medium text-stone-700">Processing</span>
                                    </div>
                                )}

                                {message && (
                                    <div className={`flex items-start gap-3 rounded-xl border p-4 ${
                                        message.type === "error" 
                                            ? "bg-red-50 border-red-200" 
                                            : "bg-green-50 border-green-200"
                                    }`}>
                                        {message.type === "error" ? (
                                            <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                        ) : (
                                            <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${message.type === "error" ? "text-red-900" : "text-green-900"}`}>
                                                {message.type === "error" ? "Upload failed" : "Success"}
                                            </p>
                                            <p className={`text-sm mt-1 ${message.type === "error" ? "text-red-700" : "text-green-700"}`}>
                                                {message.text}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                    </CardContent>
                </Card>

                <div className="mt-8">
                    <Link
                        href="/chat"
                        className="inline-flex items-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                    >
                        Go to Chat
                    </Link>
                </div>
            </div>
        </div>
    )
}