import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
    variable: "--font-body-sans",
    subsets: ["latin"],
    weight: ["400", "600"],
});

export const metadata: Metadata = {
    title: "Maine News Now",
    description: "Editorial Minimalism with Live Intelligence.",
};

const customAdsUrl = process.env.NEXT_PUBLIC_CUSTOM_ADS_URL;
const customAdsMaxSlots = process.env.NEXT_PUBLIC_CUSTOM_ADS_MAX_SLOTS || "4";
const customAdsAllowedPaths = process.env.NEXT_PUBLIC_CUSTOM_ADS_ALLOWED_PATHS || "";
const customAdsBlockedPaths = process.env.NEXT_PUBLIC_CUSTOM_ADS_BLOCKED_PATHS || "";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.variable}>
                {children}
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9175938417906735"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
                {customAdsUrl ? (
                    <Script
                        async
                        src={`${customAdsUrl.replace(/\/$/, "")}/widget.js`}
                        data-site="maine-news"
                        data-max-slots={customAdsMaxSlots}
                        data-allowed-paths={customAdsAllowedPaths}
                        data-blocked-paths={customAdsBlockedPaths}
                        strategy="afterInteractive"
                    />
                ) : null}
            </body>
        </html>
    );
}
