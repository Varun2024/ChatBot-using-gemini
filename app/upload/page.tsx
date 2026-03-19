"use client";

import { useState } from "react";
import { processPDFile } from "./action";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
        }catch(err){
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
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    PDF upload
                </h1>
                <Card className="mb-6 ">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Label htmlFor="pdf-upload">Upload PDF file</Label>
                            <Input
                                id="pdf-upload"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="mt-2"
                            />
                        </div>
                        {isLoading && (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-5 w-5 " />
                                    <span className="text-muted-foreground">Processing...</span>
                                </div>
                            )}
                        {message && (
                            <Alert variant={message.type === "error" ? "destructive" : "success"} className="mt-4">
                                <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}