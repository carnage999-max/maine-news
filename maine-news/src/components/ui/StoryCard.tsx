import Link from 'next/link';
import Image from 'next/image';
import styles from './StoryCard.module.css';

interface StoryCardProps {
    title: string;
    image?: string;
    slug: string;
    category?: string;
    priority?: boolean;
}

export default function StoryCard({ title, image, slug, category, priority = false }: StoryCardProps) {
    return (
        <Link href={`/article/${slug}`} className={styles.card}>
            {image && (
                <div className={styles.imageWrapper}>
                    <Image
                        src={image}
                        alt=""
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority={priority}
                    />
                </div>
            )}
            <div className={styles.content}>
                {category && <span className={styles.category}>{category}</span>}
                <h3 className={styles.title}>{title}</h3>
            </div>
        </Link>
    );
}
