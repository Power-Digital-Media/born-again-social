import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Born Again Social Studio | Content Operating System",
  description: "Automated hyper-local social media campaign generator & real-photo creative studio for Born Again Remodeling & Roofing.",
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
