import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navigation } from "@/components/navigation";
const soraSans = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signal Desk",
  description:
    "Minimal AI workspace for chat and document-grounded answers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${soraSans.variable} ${jetbrainsMono.variable} antialiased`}
        >
          <Navigation />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
