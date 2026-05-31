import type { Metadata } from 'next';
import { getTrafficReport } from '@/lib/traffic';
import TrafficPageView from './TrafficPageView';

export const metadata: Metadata = {
    title: 'Maine traffic alerts | Maine News Now',
    description: 'Live Maine traffic incidents and corridor alerts powered by TomTom Traffic.',
};

export const revalidate = 60;

export default async function TrafficPage() {
    const report = await getTrafficReport(60);
    return <TrafficPageView report={report} />;
}
