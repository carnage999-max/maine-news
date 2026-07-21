import CategoryPage from '@/components/layout/CategoryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Maine Sports | High School, College & Professional Sports News',
    description: 'Follow Maine high school, college, and professional sports news, game updates, and team reports from Maine News Now.',
};

export const dynamic = 'force-dynamic';

export default function MaineSportsCategoryPage() {
    return (
        <CategoryPage
            categoryKey="sports"
            h1="Maine Sports"
            intro="Follow Maine high school, college, and professional sports news, game updates, team reports, and highlights."
        />
    );
}
