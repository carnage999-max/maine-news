import type { Metadata } from 'next';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: `${SITE_TITLE} | Maine News Now`,
    description: SITE_DESCRIPTION,
    keywords: [
        "Nathan Reardon Lowe's lawsuit",
        "Reardon v Lowe's Home Centers",
        "Lowe's Brewer Maine lawsuit",
        "Lowe's summary judgment denied",
        "Lowe's negligence lawsuit Maine",
        "Lowe's personal injury case",
        'Rule 609 impeachment convictions',
    ],
    alternates: {
        canonical: SITE_URL,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'article',
        siteName: 'Maine News Now',
        title: `${SITE_TITLE} | Maine News Now`,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        locale: 'en_US',
        images: [
            {
                url: '/image-2.jpeg',
                width: 1536,
                height: 1024,
                alt: SITE_TITLE,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE_TITLE} | Maine News Now`,
        description: SITE_DESCRIPTION,
        images: ['/image-2.jpeg'],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
