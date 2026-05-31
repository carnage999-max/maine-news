import CategoryPage from '@/components/layout/CategoryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Maine News | Latest Local Stories Across Maine',
    description: 'Read the latest Maine news from Maine News Now, covering local stories, community updates, public safety, politics, weather, business, and more.',
};

export default function MaineNewsCategoryPage() {
    return (
        <CategoryPage
            categoryKey="local"
            h1="Maine News"
            intro="Follow the latest Maine news from across the state, including local stories, community updates, public safety reports, politics, weather, business, and more."
        />
    );
}
