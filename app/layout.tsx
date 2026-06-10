import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOP Assessment | Leadership Operating Profile",
  description: "Enterprise leadership assessment platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
