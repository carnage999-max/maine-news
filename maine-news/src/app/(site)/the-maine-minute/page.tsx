import type { Metadata } from 'next';
import MaineMinuteBrief from '@/components/minute/MaineMinuteBrief';
import { buildMaineMinuteReport } from '@/lib/maineMinuteReport';

export const dynamic = 'force-dynamic';
export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    try {
        const report = await buildMaineMinuteReport();
        const dateLabel = new Date(report.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        return {
            title: `The Maine Minute — ${dateLabel} | Maine News Now`,
            description: report.subhead,
            openGraph: {
                title: `The Maine Minute — ${dateLabel}`,
                description: report.subhead,
                type: 'article'
            }
        };
    } catch {
        return {
            title: 'The Maine Minute | Maine News Now',
            description: 'A one-minute digest of everything that matters in Maine.',
        };
    }
}

export default async function MaineMinutePage() {
    try {
        const report = await buildMaineMinuteReport();
        return <MaineMinuteBrief report={report} />;
    } catch (error) {
        const isQuotaError =
            error instanceof Error &&
            (error.message.includes('402') || error.message.includes('data transfer quota'));

        return (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
                <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '1rem' }}>
                    The Maine Minute
                </p>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                    {isQuotaError ? "Today's digest is temporarily unavailable" : "Something went wrong"}
                </h1>
                <p style={{ color: '#666', lineHeight: 1.6 }}>
                    {isQuotaError
                        ? "We're experiencing high demand on our database. The Maine Minute will be back shortly — check back in a few minutes."
                        : "We couldn't load today's digest. Please try refreshing the page."}
                </p>
            </div>
        );
    }
}
