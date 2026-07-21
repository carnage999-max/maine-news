import type { Metadata } from 'next';
import { desc } from 'drizzle-orm';
import NewsroomProfiles from '@/components/newsroom/NewsroomProfiles';
import { db } from '@/db';
import { authors } from '@/db/schema';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Newsroom | Maine News Now',
    description: 'Meet the reporters and contributors behind Maine News Now coverage.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function NewsroomPage() {
    const profiles = await db.query.authors.findMany({
        orderBy: [desc(authors.createdAt)],
        columns: {
            id: true,
            name: true,
            role: true,
            avatar: true,
            bio: true,
            email: true,
            contactInfo: true,
        },
    });

    return (
        <main className={`container ${styles.page}`}>
            <section className={styles.hero}>
                <span className={styles.kicker}>Meet the newsroom</span>
                <h1 className={styles.title}>Reporters and contributors</h1>
                <p className={styles.copy}>
                    Browse the Maine News Now team, learn who covers what, and reach out directly for tips, interviews, and contributor contact.
                </p>
            </section>

            <NewsroomProfiles profiles={profiles} />
        </main>
    );
}
