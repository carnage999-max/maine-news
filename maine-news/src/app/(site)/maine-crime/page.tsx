import CategoryPage from '@/components/layout/CategoryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Maine Crime | Local Crime Reports & Public Safety News',
    description: 'Follow local crime reports, public safety updates, and police news from Maine News Now.',
};

export const dynamic = 'force-dynamic';

export default function MaineCrimeCategoryPage() {
    return (
        <CategoryPage
            categoryKey="crime"
            h1="Maine Crime"
            intro="Follow local crime reports, public safety updates, police logs, and court updates from across Maine."
        />
    );
}
