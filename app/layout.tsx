import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Sidekicks - OpenAI Build Week 2026",
  description: "One family memory. A Sidekick for every corner of family life.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
