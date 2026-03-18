'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, error, status } = useChat();

  const isSending = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
        </div>
      ))}

      {error ? (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      {isSending ? (
        <div className="mb-4 text-sm text-zinc-500">Generating response...</div>
      ) : null}

      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.trim() || isSending) return;
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          disabled={isSending}
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}