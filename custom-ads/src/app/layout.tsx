import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ads by Se7enInc",
  description: "Reusable ad management and delivery service by Se7enInc.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
