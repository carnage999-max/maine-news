import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.imageWrapper}>
                <Image
                    src="/maine-news-longer-img.jpeg"
                    alt="Maine News Today"
                    fill
                    className={styles.image}
                    priority
                    sizes="100vw"
                />
                <div className={styles.overlay} />
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>Maine News Today</h1>
                <p className={styles.subtitle}>Unbiased. Unafraid. Unfiltered.</p>
            </div>
        </section>
    );
}
