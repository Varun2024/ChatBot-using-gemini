import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-10">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          CB Chatbot
        </h1>
        <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
          A simple chat UI powered by OpenRouter. Sign in if you want, then open
          the chat and start asking questions.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/chat">Open chat</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
