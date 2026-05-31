import React from 'react';
import { Metadata } from 'next';
import styles from '../privacy-policy/Policy.module.css';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with Maine News Now. Find contact info for general inquiries, news tips, advertising, and corrections.',
};

export default function ContactPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Contact Us</h1>
            <div className={styles.content}>
                <p>We welcome your feedback, news tips, advertising requests, and corrections. Please use the appropriate contact channels below to reach our team.</p>

                <section style={{ marginTop: '2.5rem' }}>
                    <h2>General Contact</h2>
                    <p>For general inquiries, feedback, or comments about our coverage, please email us at:</p>
                    <p><strong>Email:</strong> <a href="mailto:info@mainenewsnow.com">info@mainenewsnow.com</a></p>
                </section>

                <section>
                    <h2>News Tips</h2>
                    <p>Do you have a breaking news tip or a story we should cover? Contact our newsroom directly:</p>
                    <p><strong>Email:</strong> <a href="mailto:tips@mainenewsnow.com">tips@mainenewsnow.com</a></p>
                    <p><em>Please include any relevant photos, videos, or documents to support your tip.</em></p>
                </section>

                <section>
                    <h2>Advertising</h2>
                    <p>To reach our audience and learn more about digital advertising opportunities on Maine News Now, contact our sales department:</p>
                    <p><strong>Email:</strong> <a href="mailto:advertise@mainenewsnow.com">advertise@mainenewsnow.com</a></p>
                </section>

                <section>
                    <h2>Corrections</h2>
                    <p>Maine News Now is committed to accuracy and fairness. If you believe we have made a factual error in our reporting, please contact us for corrections:</p>
                    <p><strong>Email:</strong> <a href="mailto:corrections@mainenewsnow.com">corrections@mainenewsnow.com</a></p>
                    <p><em>Please include the link to the story and details about the correction needed.</em></p>
                </section>
            </div>
        </main>
    );
}
