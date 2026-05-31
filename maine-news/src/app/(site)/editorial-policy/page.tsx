import React from 'react';
import { Metadata } from 'next';
import styles from './Policy.module.css';
import { EDITORIAL_DISCLAIMER_PARAGRAPHS } from '@/lib/editorialDisclaimer';

export const metadata: Metadata = {
    title: 'Editorial Policy',
    description: 'Read the Editorial Policy for Maine News Now, detailing our commitment to accuracy, corrections, and attribution.',
};

export default function EditorialPolicyPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Editorial Policy</h1>
            <div className={styles.content}>
                <p>Last Updated: January 14, 2026</p>

                <section>
                    <h2>Editorial Disclaimer</h2>
                    {EDITORIAL_DISCLAIMER_PARAGRAPHS.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </section>
            </div>
        </main>
    );
}
