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
                <p><strong>Gold Standard Edition</strong></p>
                <p>Last Updated: May 30, 2026</p>

                <section>
                    <h2>Introduction</h2>
                    <p>This Privacy Policy describes how Maine News Now (“Company,” “we,” “our,” or “us”) collects, uses, discloses, and safeguards personal information across all current and future websites, subdomains, and online services (collectively, the “Services”). This Policy sets a global standard for privacy compliance and data protection. It applies to all users regardless of geographic location.</p>
                </section>

                <section>
                    <h2>1. Scope and Applicability</h2>
                    <p>This Policy applies to all visitors, customers, and users of our Services, and to all data collected online or offline through any form of interaction. By using our Services, you consent to the practices described herein.</p>
                </section>

                <section>
                    <h2>2. Information We Collect</h2>
                    <p>We collect personal data directly and automatically, including identifiers (name, email, phone number, address), geolocation, internet activity, behavioral analytics, device identifiers, and any other data required for lawful and legitimate business operations.</p>
                </section>

                <section>
                    <h2>3. Automated and AI‑Based Processing</h2>
                    <p>We utilize Artificial Intelligence and Machine Learning (“AI/ML”) technologies to analyze behavioral data, enhance service personalization, detect fraud, and improve user experience.</p>
                </section>

                <section>
                    <h2>4. How We Use Information</h2>
                    <p>We process data for legitimate business purposes: service delivery, account management, communication, compliance, analytics, marketing, personalization, and platform security.</p>
                </section>

                <section>
                    <h2>5. Disclosure and Data Sharing</h2>
                    <p>We do not sell personal data. We share information only with trusted service providers, payment processors, affiliates, analytics vendors, advertising partners, and legal authorities when required by law.</p>
                </section>

                <section>
                    <h2>6. International Data Transfers</h2>
                    <p>Data may be processed and stored in the United States and other jurisdictions. All transfers comply with standard contractual clauses and equivalent safeguards.</p>
                </section>

                <section>
                    <h2>7. Data Retention</h2>
                    <p>Personal data is retained only for as long as necessary to fulfill the purposes for which it was collected or as required by law.</p>
                </section>

                <section>
                    <h2>8. Children’s Privacy</h2>
                    <p>We comply with the Children’s Online Privacy Protection Act (COPPA) and do not knowingly collect data from children under 13 years old (or 16 in applicable jurisdictions) without verifiable parental consent.</p>
                </section>

                <section>
                    <h2>9. Your Rights</h2>
                    <p>Depending on your jurisdiction, you may have the right to access, correct, delete, restrict processing, object to processing, port your data, or withdraw consent. Requests can be submitted using the contact information below.</p>
                </section>

                <section>
                    <h2>10. Security and Safeguards</h2>
                    <p>We employ administrative, technical, and physical safeguards including encryption, role-based access controls, and multi-factor authentication.</p>
                </section>

                <section>
                    <h2>11. Cookies and Tracking Technologies</h2>
                    <p>We use cookies, web beacons, pixels, device identifiers, IP addresses, and similar technologies for site functionality, analytics, advertising, fraud prevention, security, and performance measurement.</p>
                </section>

                <section>
                    <h2>12. Advertising, Google AdSense, and Third-Party Ad Partners</h2>
                    <p>We may display advertisements on the Services, including ads served by Google AdSense and other third-party advertising partners. These partners may use cookies, web beacons, IP addresses, device identifiers, and other usage information to serve ads, limit repeated ads, measure ad performance, prevent fraud, and improve advertising systems.</p>
                    <p>Google, as a third-party vendor, uses cookies to serve ads on our Services. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on a user&apos;s visit to our Services and other websites or apps.</p>
                    <p>You can learn more about how Google uses information from sites and apps that use Google services at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google&apos;s partner sites policy</a>. You can manage Google ad personalization at <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">My Ad Center</a>.</p>
                </section>

                <section>
                    <h2>13. Cross‑Border Compliance</h2>
                    <p>This Policy incorporates global privacy principles such as lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, integrity, and accountability.</p>
                </section>

                <section>
                    <h2>14. Data Protection Officer and Contact</h2>
                    <p>We maintain a designated Data Protection Officer (“DPO”) to oversee compliance. Users may exercise their rights or submit complaints via email at <a href="mailto:privacy@mainenewsnow.com">privacy@mainenewsnow.com</a> or by mail to our registered office in Florida, USA.</p>
                </section>

                <section>
                    <h2>15. Updates to This Policy</h2>
                    <p>We may update this Policy to reflect legal, technical, or business developments. The latest version will always be available on our website, with a new &apos;Last Updated&apos; date.</p>
                </section>

                <p>© 2026 Maine News Now. All rights reserved.</p>
            </div>
        </main>
    );
}
