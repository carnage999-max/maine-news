import Link from 'next/link';
import styles from './Sections.module.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'News Sections',
    description: 'Explore the main news sections of Maine News Now, including local news, politics, crime, sports, weather, business, and opinions.',
};

const SECTIONS = [
    { title: 'Local Maine News', href: '/maine-news', description: 'Community news, breaking reports, and local updates across Maine.' },
    { title: 'Maine Weather', href: '/maine-weather', description: 'Local forecasts, storm alerts, and seasonal weather reports.' },
    { title: 'Maine Politics', href: '/maine-politics', description: 'State government updates, local elections, and policy changes.' },
    { title: 'Maine Crime & Safety', href: '/maine-crime', description: 'Local crime updates, police logs, and public safety alerts.' },
    { title: 'Maine Sports', href: '/maine-sports', description: 'High school, college, and professional sports coverage.' },
    { title: 'Maine Business', href: '/maine-business', description: 'Local economic trends, business developments, and commerce.' },
    { title: 'Maine Opinion', href: '/maine-opinion', description: 'Editorials, local columns, and perspectives from community voices.' },
];

export default function SectionsPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Sections</h1>

            <div className={styles.grid}>
                {SECTIONS.map((section) => (
                    <Link key={section.href} href={section.href} className={styles.card}>
                        <h2 className={styles.cardTitle}>{section.title}</h2>
                        <p className={styles.cardDesc}>{section.description}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
