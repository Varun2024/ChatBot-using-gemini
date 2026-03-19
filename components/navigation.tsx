import {
    SignInButton,
    SignOutButton,
    SignUpButton,
    UserButton,
    Show,
} from "@clerk/nextjs"
import Link from "next/link"
import { MessageSquare, ScanText } from "lucide-react"

import { Button } from "./ui/button"
export const Navigation = () => {
    return (
        <nav className="border-b border-black/10 bg-stone-50/90 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-lg font-semibold tracking-tight text-black">
                        Signal Desk
                    </Link>
                    <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white p-1 sm:flex">
                        <Link
                            href="/chat"
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-black"
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chat
                        </Link>
                        <Link
                            href="/upload"
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-black"
                        >
                            <ScanText className="h-3.5 w-3.5" />
                            Upload
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Show when="signed-in">
                        <UserButton />
                        <SignOutButton>
                            <Button variant="outline" className="border-black/20 bg-white text-black hover:bg-stone-100">Sign out</Button>
                        </SignOutButton>
                    </Show>
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <Button variant="outline" className="border-black/20 bg-white text-black hover:bg-stone-100">Sign in</Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button className="bg-black text-white hover:bg-stone-800">Sign up</Button>
                        </SignUpButton>
                    </Show>
                </div>
            </div>
        </nav>
    )
}