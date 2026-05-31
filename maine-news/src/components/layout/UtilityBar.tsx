'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CloudSun, Ticket } from 'lucide-react';
import styles from './UtilityBar.module.css';
import { getLatestLotteryResults, type LotteryResult } from '@/lib/lottery';

interface UtilityWeather {
    location: string;
    temperature?: number;
    temperatureUnit?: string;
}

export default function UtilityBar() {
    const [weather, setWeather] = useState<UtilityWeather | null>(null);
    const [lottery, setLottery] = useState<LotteryResult[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    useEffect(() => {
        let active = true;

        async function loadLottery() {
            const results = await getLatestLotteryResults();
            if (active) {
                setLottery(results);
            }
        }

        loadLottery();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (lottery.length <= 1) return;

        const timer = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % lottery.length);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [lottery]);

    const dateLabel = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date());

    const activeLottery = lottery[currentIndex];

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

                <div className={styles.lotteryCluster}>
                    <div className={styles.lotteryLabel}>
                        <Ticket size={13} className={styles.lotteryIcon} />
                        <span>Maine Lottery</span>
                    </div>
                    {activeLottery ? (
                        <div className={styles.lotteryItem}>
                            <span className={styles.gameName}>{activeLottery.game}</span>
                            <div className={styles.numbers}>
                                {activeLottery.numbers.slice(0, 5).map((value, index) => (
                                    <span key={`${activeLottery.game}-${index}`} className={styles.number}>{value}</span>
                                ))}
                                {activeLottery.extra && (
                                    <span className={`${styles.number} ${styles.extraNumber}`}>{activeLottery.extra}</span>
                                )}
                            </div>
                            {activeLottery.jackpot && (
                                <span className={styles.jackpot}>{activeLottery.jackpot}</span>
                            )}
                        </div>
                    ) : (
                        <span className={styles.lotteryFallback}>Latest draws loading</span>
                    )}
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
