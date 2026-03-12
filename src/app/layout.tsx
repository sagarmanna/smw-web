import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/color-adaptation.css";
import "@/styles/accessibility.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { Toaster } from "sonner";
import { ChunkErrorHandler } from "@/components/ChunkErrorHandler";
import { OpenReplayTracker } from "@/components/OpenReplayTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMW",
  description: "SMW",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OpenReplayTracker />
        <ChunkErrorHandler />
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AccessibilityProvider>
              {children}
              <Toaster position="top-center" richColors />
            </AccessibilityProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
