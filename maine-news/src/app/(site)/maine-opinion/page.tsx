import CategoryPage from '@/components/layout/CategoryPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Maine Opinion | Editorials, Columns & Community Perspectives',
    description: 'Read community perspectives, editorials, letters to the editor, and columns from Maine News Now.',
};

export const dynamic = 'force-dynamic';

export default function MaineOpinionCategoryPage() {
    return (
        <CategoryPage
            categoryKey="opinion"
            h1="Maine Opinion"
            intro="Read community perspectives, editorials, letters to the editor, and guest columns from Maine News Now."
        />
    );
}
