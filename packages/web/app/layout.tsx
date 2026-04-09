import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diligence Copilot",
  description: "Agentic due diligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
