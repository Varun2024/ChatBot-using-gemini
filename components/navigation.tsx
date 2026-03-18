import {
    SignInButton,
    SignOutButton,
    SignUpButton,
    UserButton,
    Show,
} from "@clerk/nextjs"

import { Button } from "./ui/button"
export const Navigation = () => {
    return (
        <nav className="border-b border-[var(--foreground)]/10">
            <div className="flex container h-16 items-center justify-between px-4 mx-auto">
                <div className="text-xl font-semibold">CB chatbot</div>
                <div className="flex gap-2">
                    <Show when="signed-in">
                        <UserButton />
                        <SignOutButton>
                            <Button variant="outline">Sign out</Button>
                        </SignOutButton>
                    </Show>
                    <Show when="signed-out">
                        <SignInButton />
                        <SignUpButton mode="modal">
                            <Button value="ghost">Sign up</Button>
                        </SignUpButton>
                    </Show>
                </div>
            </div>
        </nav>
    )
}