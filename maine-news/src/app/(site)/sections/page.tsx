import Link from 'next/link';
import styles from './Sections.module.css';

const SECTIONS = [
    { title: 'Local', slug: 'local', description: 'Community news and events.' },
    { title: 'Politics', slug: 'politics', description: 'State House updates and policy analysis.' },
    { title: 'Opinion', slug: 'opinion', description: 'Editorials, columns, and letters.' },
    { title: 'Business', slug: 'business', description: 'Economic trends and local enterprise.' },
    { title: 'Environment', slug: 'environment', description: 'Conservation, climate, and coast.' },
    { title: 'Arts & Culture', slug: 'arts', description: 'Music, theater, and gallery listings.' },
];

export default function SectionsPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Sections</h1>

            <div className={styles.grid}>
                {SECTIONS.map((section) => (
                    <Link key={section.slug} href={`/#${section.slug}`} className={styles.card}>
                        <h2 className={styles.cardTitle}>{section.title}</h2>
                        <p className={styles.cardDesc}>{section.description}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
