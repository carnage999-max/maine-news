'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, User, X } from 'lucide-react';
import styles from './NewsroomProfiles.module.css';

const BIO_PREVIEW_LENGTH = 250;

export interface NewsroomProfile {
    id: string;
    name: string;
    role?: string | null;
    avatar?: string | null;
    bio?: string | null;
    email?: string | null;
    contactInfo?: string | null;
    moreInfoUrl?: string | null;
}

export default function NewsroomProfiles({ profiles }: { profiles: NewsroomProfile[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (!profiles.length) {
        return (
            <section className={styles.emptyState}>
                <h2>No newsroom profiles yet</h2>
                <p>Reporter and contributor biographies will appear here once they are added in the admin panel.</p>
            </section>
        );
    }

    const expandedProfile = profiles.find((profile) => profile.id === expandedId) || null;

    return (
        <section className={styles.grid}>
            {profiles.map((profile) => {
                const bio = profile.bio || 'Newsroom profile details coming soon.';
                const isLong = bio.length > BIO_PREVIEW_LENGTH;
                const preview = isLong ? `${bio.slice(0, BIO_PREVIEW_LENGTH).trim()}...` : bio;

                return (
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
                                <h2>{profile.name}</h2>
                                <span>{profile.role || 'Contributor'}</span>
                            </div>

                            <p className={styles.bio}>
                                {preview}
                                {isLong && (
                                    <button
                                        type="button"
                                        className={styles.seeMore}
                                        onClick={() => setExpandedId(profile.id)}
                                    >
                                        See more...
                                    </button>
                                )}
                            </p>

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
                );
            })}

            {expandedProfile && (
                <div className={styles.modalOverlay} onClick={() => setExpandedId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{expandedProfile.name}</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setExpandedId(null)}
                                aria-label="Close"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <span className={styles.modalRole}>{expandedProfile.role || 'Contributor'}</span>
                            <p className={styles.modalBio}>{expandedProfile.bio || 'Newsroom profile details coming soon.'}</p>

                            {expandedProfile.moreInfoUrl && (
                                <a
                                    href={expandedProfile.moreInfoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.moreInfoLink}
                                >
                                    For more information
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
