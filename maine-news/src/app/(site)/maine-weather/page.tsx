import CategoryPage from '@/components/layout/CategoryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Maine Weather | Forecasts, Alerts & Local Weather Updates',
    description: 'Get the latest Maine weather updates, forecasts, storm alerts, and local weather news from Maine News Now.',
};

export const dynamic = 'force-dynamic';

export default function MaineWeatherCategoryPage() {
    return (
        <CategoryPage
            categoryKey="weather"
            h1="Maine Weather"
            intro="Get the latest Maine weather updates, forecasts, storm alerts, and local weather news from across the state."
        />
    );
}
