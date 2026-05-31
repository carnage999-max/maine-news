'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CloudSun } from 'lucide-react';
import styles from './UtilityBar.module.css';

interface UtilityWeather {
    location: string;
    temperature?: number;
    temperatureUnit?: string;
}

export default function UtilityBar() {
    const [weather, setWeather] = useState<UtilityWeather | null>(null);

    useEffect(() => {
        let active = true;

        async function loadWeather() {
            try {
                const response = await fetch('/api/weather', { cache: 'no-store' });
                if (!response.ok) return;
                const report = await response.json();
                const centralRegion = report?.regions?.find((region: { id: string }) => region.id === 'central') || report?.regions?.[0];

                if (!active || !centralRegion) return;

                setWeather({
                    location: centralRegion.location || 'Bangor, ME',
                    temperature: centralRegion.today?.temperature,
                    temperatureUnit: centralRegion.today?.temperatureUnit,
                });
            } catch (error) {
                console.error('Failed to load utility weather', error);
            }
        }

        loadWeather();

        return () => {
            active = false;
        };
    }, []);

    const dateLabel = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className={styles.utilityBar}>
            <div className={styles.container}>
                <div className={styles.infoCluster}>
                    <span className={styles.infoItem}>{dateLabel}</span>
                    <span className={styles.separator} />
                    <span className={styles.infoItem}>
                        <CloudSun size={14} className={styles.icon} />
                        {weather?.temperature ? `${weather.temperature}${weather.temperatureUnit || 'F'}` : 'Weather'}
                    </span>
                    <span className={styles.separator} />
                    <span className={styles.infoItem}>{weather?.location || 'Bangor, ME'}</span>
                </div>

                <div className={styles.actions}>
                    <Link href="/about" className={styles.navLink}>About Us</Link>
                    <Link href="/advertise" className={styles.navLink}>Advertise</Link>
                    <Link href="/submit" className={styles.navLink}>Submit News Tip</Link>
                    <Link href="/contact" className={styles.navLink}>Contact</Link>
                    <Link href="/submit" className={styles.tipButton}>Send News Tip</Link>
                </div>
            </div>
        </div>
    );
}
