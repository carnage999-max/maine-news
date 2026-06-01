import Image from 'next/image';
import { Mail, Phone, User } from 'lucide-react';
import styles from './NewsroomSection.module.css';

export interface NewsroomProfile {
    id: string;
    name: string;
    role?: string | null;
    avatar?: string | null;
    bio?: string | null;
    email?: string | null;
    contactInfo?: string | null;
}

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

            <div className={styles.grid}>
                {profiles.map((profile) => (
                    <article key={profile.id} className={styles.card}>
                        <div className={styles.avatarWrap}>
                            {profile.avatar ? (
                                <Image src={profile.avatar} alt={profile.name} fill className={styles.avatar} unoptimized />
                            ) : (
                                <div className={styles.avatarFallback}>
                                    <User size={30} />
                                </div>
                            )}
                        </div>

                        <div className={styles.body}>
                            <div className={styles.identity}>
                                <h3>{profile.name}</h3>
                                <span>{profile.role || 'Contributor'}</span>
                            </div>

                            <p className={styles.bio}>{profile.bio || 'Newsroom profile details coming soon.'}</p>

                            <div className={styles.contacts}>
                                {profile.email && (
                                    <a href={`mailto:${profile.email}`} className={styles.contactLink}>
                                        <Mail size={14} />
                                        {profile.email}
                                    </a>
                                )}
                                {profile.contactInfo && (
                                    <span className={styles.contactText}>
                                        <Phone size={14} />
                                        {profile.contactInfo}
                                    </span>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
