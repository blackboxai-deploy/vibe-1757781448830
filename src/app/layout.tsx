import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Create stunning AI-generated images with advanced prompts and style controls. Powered by cutting-edge AI models for professional-quality image generation.",
  keywords: "AI, image generation, artificial intelligence, creative tools, digital art",
  authors: [{ name: "AI Image Generator" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen`}>
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}