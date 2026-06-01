import Image from 'next/image';
import Link from 'next/link';
import { MapPinned } from 'lucide-react';
import { MAINE_COUNTIES } from '@/lib/maineCounties';
import styles from './CountyMapPanel.module.css';

export default function CountyMapPanel() {
    return (
        <section className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <MapPinned size={16} />
                    <div>
                        <h2>Maine county map</h2>
                        <p>Pick your county for local coverage</p>
                    </div>
                </div>
            </div>

            <div className={styles.mapFrame}>
                <Image
                    src="/maine-counties-real.svg"
                    alt="Map of Maine counties"
                    fill
                    sizes="340px"
                    className={styles.mapImage}
                />
                {MAINE_COUNTIES.map((county) => (
                    <Link
                        key={county.slug}
                        href={`/county/${county.slug}`}
                        className={styles.countyPin}
                        style={{ top: county.top, left: county.left }}
                    >
                        <span>{county.name}</span>
                    </Link>
                ))}
            </div>

            <div className={styles.footer}>
                <span>County pages surface the latest stories matched to that local area.</span>
            </div>
        </section>
    );
}
