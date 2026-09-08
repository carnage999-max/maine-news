import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: "The Lowe's Case That Wouldn't Go Away | Maine News Now",
    description:
        "Court-record-based coverage of Nathan Reardon v. Lowe's Home Centers, LLC, including Lowe's failed summary-judgment effort, its pretrial strategy, and prior Lowe's injury cases.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
