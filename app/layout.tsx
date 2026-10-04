import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watch Party",
  description: "Watch together, in sync.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
