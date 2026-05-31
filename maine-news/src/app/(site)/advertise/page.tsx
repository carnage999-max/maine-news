import React from 'react';
import { Metadata } from 'next';
import styles from '../privacy-policy/Policy.module.css';

export const metadata: Metadata = {
    title: 'Advertise',
    description: 'Learn about advertising opportunities with Maine News Now to reach readers across the state of Maine.',
};

export default function AdvertisePage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Advertise with Us</h1>
            <div className={styles.content}>
                <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '2rem' }}>
                    Advertise with Maine News Now to reach readers interested in Maine local news, weather, politics, business, sports, and community updates.
                </p>

                <section>
                    <h2>Why Partner with Maine News Now?</h2>
                    <p>Maine News Now is a fast-growing digital news platform delivering real-time news and weather forecasts directly to readers across Maine. By placing your ad on our website and in our mobile application, your brand will gain visibility among highly engaged local audiences.</p>
                </section>

                <section>
                    <h2>Ad Solutions</h2>
                    <p>We offer flexible digital advertising formats tailored to your business needs, including:</p>
                    <p>• <strong>Display Banner Ads:</strong> Prominent ad placements on our high-traffic home feed and news category landing pages.</p>
                    <p>• <strong>Article Ads:</strong> Inline display spots embedded within article page layouts for maximum reader visibility.</p>
                    <p>• <strong>Sponsorships:</strong> Exclusive sponsorships of premium sections, weather alerts, or special features.</p>
                </section>

                <section>
                    <h2>Get in Touch</h2>
                    <p>Ready to start advertising? Contact our advertising sales team for rate cards, ad slot packages, and custom solutions:</p>
                    <p><strong>Email:</strong> <a href="mailto:advertise@mainenewsnow.com">advertise@mainenewsnow.com</a></p>
                </section>
            </div>
        </main>
    );
}
