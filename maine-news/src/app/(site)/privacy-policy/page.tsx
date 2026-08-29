import React from 'react';
import { Metadata } from 'next';
import styles from './Policy.module.css';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Read the Privacy Policy for Maine News Now, detailing how we collect, use, and safeguard personal information.',
};

export default function PrivacyPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <div className={styles.content}>
                <p>Last Updated: August 28, 2026</p>

                <section>
                    <h2>Introduction</h2>
                    <p>This Privacy Policy describes how Maine News Now (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) handles information across our website and our iOS and Android mobile apps (collectively, the &quot;Services&quot;). We&apos;ve written this to describe what we actually do, not a generic template &mdash; if a practice isn&apos;t listed here, we don&apos;t do it.</p>
                </section>

                <section>
                    <h2>1. Information We Collect</h2>
                    <p><strong>News tips you submit.</strong> Our mobile app and website let you send a news tip (a headline and details, and an option to remain anonymous). If you don&apos;t choose to stay anonymous, whatever contact details you choose to include in that submission are stored so our editors can follow up.</p>
                    <p><strong>Video viewing data, via Google.</strong> Our Video Hub plays videos using an embedded YouTube player. Google collects device identifiers and viewing activity through that embed, independent of anything we do. On iOS, we ask for your permission via Apple&apos;s App Tracking Transparency prompt before this can happen.</p>
                    <p><strong>Advertising data, via Google AdSense and our own ad platform.</strong> Our website displays ads served by Google AdSense and by our own ad-serving system. These systems use cookies, IP addresses, and device identifiers to deliver ads and measure how they perform.</p>
                    <p><strong>What we don&apos;t collect.</strong> We don&apos;t require an account to use the app or site, so we don&apos;t collect your name, email address, phone number, or physical address unless you choose to give it to us directly (for example, in a news tip or an email to us). We don&apos;t access your device&apos;s GPS or location. We don&apos;t process payments &mdash; there&apos;s nothing to buy in the app.</p>
                </section>

                <section>
                    <h2>2. How We Use Information</h2>
                    <p>We use news tips to inform and follow up on our reporting. We use video-viewing and advertising data, collected by Google and our ad platform as described above, to deliver and measure advertising and video content. We don&apos;t use any of this to build a profile of you beyond what&apos;s described here.</p>
                </section>

                <section>
                    <h2>3. Google, YouTube, and Advertising</h2>
                    <p>Google, as a third-party vendor, uses cookies and device identifiers to serve ads on our website and, through the embedded YouTube player, in our mobile app. This lets Google (and its advertising partners) serve ads based on your activity across our Services and other websites or apps.</p>
                    <p>On iOS, before any tracking-capable Google content loads in the app, we display Apple&apos;s App Tracking Transparency prompt. If you decline, we don&apos;t attempt to bypass that choice.</p>
                    <p>You can learn more about how Google uses this information at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google&apos;s partner sites policy</a>, and manage ad personalization at <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">My Ad Center</a>.</p>
                </section>

                <section>
                    <h2>4. Cookies and Tracking Technologies</h2>
                    <p>Our website uses cookies and similar technologies for basic site functionality and for the advertising purposes described above. Our mobile app stores a small amount of data locally on your device (like whether you&apos;ve completed onboarding) &mdash; this stays on your device and isn&apos;t transmitted to us.</p>
                </section>

                <section>
                    <h2>5. Data Sharing</h2>
                    <p>We do not sell personal data. We share data only with the service providers named above (Google, for advertising and video) and our hosting provider, which is necessary to run the Services, or when required by law.</p>
                </section>

                <section>
                    <h2>6. Data Retention</h2>
                    <p>News tips are retained for as long as needed for editorial review and follow-up. Advertising and video-viewing data is handled according to Google&apos;s own retention practices, linked above.</p>
                </section>

                <section>
                    <h2>7. Children&apos;s Privacy</h2>
                    <p>Our Services are not directed at children under 13, and we do not knowingly collect information from children under 13.</p>
                </section>

                <section>
                    <h2>8. Your Rights</h2>
                    <p>Depending on your location, you may have the right to access, correct, or request deletion of information you&apos;ve given us directly, such as a submitted news tip. To make a request, contact us using the information below.</p>
                </section>

                <section>
                    <h2>9. Contact</h2>
                    <p>Questions about this policy or your data can be sent to <a href="mailto:privacy@mainenewsnow.com">privacy@mainenewsnow.com</a>.</p>
                </section>

                <section>
                    <h2>10. Changes to This Policy</h2>
                    <p>If we change what we collect or how we use it, we&apos;ll update this page and the &quot;Last Updated&quot; date above.</p>
                </section>

                <p>© 2026 Maine News Now. All rights reserved.</p>
            </div>
        </main>
    );
}
