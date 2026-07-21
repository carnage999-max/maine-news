import CategoryPage from '@/components/layout/CategoryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Maine Business | Local Economy, Industry & Business News',
    description: 'Get the latest Maine business news, local economic updates, and industry developments from Maine News Now.',
};

export const dynamic = 'force-dynamic';

export default function MaineBusinessCategoryPage() {
    return (
        <CategoryPage
            categoryKey="business"
            h1="Maine Business"
            intro="Get the latest Maine business news, local economic updates, real estate trends, and industry developments from across the state."
        />
    );
}
