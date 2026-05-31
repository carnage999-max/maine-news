import type { Metadata } from "next";
import { Oswald, Inter, Libre_Baskerville } from "next/font/google";
import Header from "@/components/layout/Header";
import UtilityBar from "@/components/layout/UtilityBar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SmartBanner from "@/components/ui/SmartBanner";
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

const libreBaskerville = Libre_Baskerville({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mainenewsnow.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Maine News Now | Local Maine News, Weather, Politics & Breaking Stories",
    template: "%s | Maine News Now"
  },
  description: "Maine News Now delivers local Maine news, weather, politics, crime, sports, business, opinion, and breaking stories across Maine.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mainenewsnow.com/',
    siteName: 'Maine News Now',
    title: 'Maine News Now | Local Maine News, Weather, Politics & Breaking Stories',
    description: 'Maine News Now delivers local Maine news, weather, politics, crime, sports, business, opinion, and breaking stories across Maine.',
    images: [
      {
        url: 'https://www.mainenewsnow.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maine News Now',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maine News Now | Local Maine News, Weather, Politics & Breaking Stories',
    description: 'Maine News Now delivers local Maine news, weather, politics, crime, sports, business, opinion, and breaking stories across Maine.',
    images: ['https://www.mainenewsnow.com/og-image.jpg'],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "Maine News Now",
  "url": "https://www.mainenewsnow.com",
  "logo": "https://www.mainenewsnow.com/logo.png",
  "sameAs": [
    "https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr",
    "https://play.google.com/store/apps/details?id=com.mainenewstoday.app"
  ],
  "description": "Maine News Now delivers local Maine news, weather, politics, crime, sports, business, opinion, and breaking stories across Maine.",
  "areaServed": {
    "@type": "State",
    "name": "Maine"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Maine News Now",
  "url": "https://www.mainenewsnow.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.mainenewsnow.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${oswald.variable} ${inter.variable} ${libreBaskerville.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <SmartBanner />
      <UtilityBar />
      <Header />
      <main className="siteMain">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
