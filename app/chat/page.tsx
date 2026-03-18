"use client";

import { Fragment, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
    PromptInput,
    PromptInputBody,
    PromptInputFooter,
    type PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { MessageResponse } from "@/components/ai-elements/message";


export default function Chat() {

    const [input, setInput] = useState("");
    const { messages, sendMessage, error, status, stop } = useChat();

    const handleSubmit = (message: PromptInputMessage) => {
        if (!message.text) return;
        sendMessage(message);
        setInput("");
    };

    const isSending = status === "submitted" || status === "streaming";
    const canSubmit = input.trim().length > 0;

    return <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-4xl flex-col p-4 md:p-6">
        <div className="flex flex-col h-full">
            <Conversation className="min-h-0 flex-1">
                <ConversationContent >
                    {messages.map((msg) => (
                        <div key={msg.id} >
                            {msg.parts.map((part, i) => {
                                switch (part.type) {
                                    case "text":
                                        if (typeof part.text !== "string") return null;
                                        return (
                                            <Fragment key={`${msg.id}-${i}`}>
                                                <Message from={msg.role}>
                                                    <MessageContent>
                                                        <MessageResponse className="">{part.text}</MessageResponse>
                                                    </MessageContent>
                                                </Message>
                                            </Fragment>
                                        )
                                    default:
                                        return null;
                                }
                            })}
                        </div>
                    ))}

                    {(status === "submitted" || status === "streaming") && (
                        <Message from="assistant">
                            <MessageContent>
                                <MessageResponse>Generating response...</MessageResponse>
                            </MessageContent>
                        </Message>
                    )}

                    {error && (
                        <Message from="system">
                            <MessageContent>
                                <MessageResponse className="text-red-500">{error.message}</MessageResponse>
                            </MessageContent>
                        </Message>
                    )}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>
            <PromptInput onSubmit={handleSubmit} className="mt-4 shrink-0">
                <PromptInputBody>
                    <PromptInputTextarea
                        className="min-h-12 max-h-40"
                        disabled={isSending}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </PromptInputBody>
                <PromptInputFooter>
                    <PromptInputSubmit
                        disabled={!canSubmit && !isSending}
                        onStop={stop}
                        status={status}
                    />
                </PromptInputFooter>
            </PromptInput>
        </div>
    </div>
}
