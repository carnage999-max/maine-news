import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import type { NewsroomProfile } from '@/components/newsroom/NewsroomProfiles';
import styles from './NewsroomSection.module.css';

export default function NewsroomSection({ profiles }: { profiles: NewsroomProfile[] }) {
    if (!profiles.length) return null;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <span className={styles.kicker}>Meet the newsroom</span>
                    <h2>Reporters and contributors</h2>
                </div>
                <p>
                    Reach the Maine News Now team directly for tips, beat coverage, and contributor outreach.
                </p>
            </div>

            <Link href="/newsroom" className={styles.card}>
                <div className={styles.teaserIcon}>
                    <Users size={28} />
                </div>

                <div className={styles.body}>
                    <div className={styles.identity}>
                        <h3>Open the newsroom directory</h3>
                        <span>{profiles.length} team member{profiles.length === 1 ? '' : 's'}</span>
                    </div>

                    <p className={styles.bio}>
                        View reporter bios, contributor contacts, and direct outreach details on the dedicated newsroom page.
                    </p>

                    <div className={styles.linkRow}>
                        <span>View reporters and contributors</span>
                        <ArrowRight size={16} />
                    </div>
                </div>
            </Link>
        </section>
    );
}
