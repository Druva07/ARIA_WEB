import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARIA Web",
  description: "Activity-aware Remembrance & Intelligent Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
