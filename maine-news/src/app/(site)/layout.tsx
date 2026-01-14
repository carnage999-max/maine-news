import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import "../globals.css";

const oswald = Oswald({
  variable: "--font-heading-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Maine News Today",
  description: "Editorial Minimalism with Live Intelligence. Unbiased. Unafraid. Unfiltered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${inter.variable}`}>
        <Header />
        <main className="container" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
