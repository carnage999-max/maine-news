import CategoryPage from '@/components/layout/CategoryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Maine Politics | State Government, Elections & Policy News',
    description: 'Follow Maine politics, state government, elections, policy updates, and public affairs news from Maine News Now.',
};

export const dynamic = 'force-dynamic';

export default function MainePoliticsCategoryPage() {
    return (
        <CategoryPage
            categoryKey="politics"
            h1="Maine Politics"
            intro="Follow Maine politics, state government, elections, policy updates, and public affairs news from across the state."
        />
    );
}
