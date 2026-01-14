import styles from './LiveTicker.module.css';

interface LiveTickerProps {
    headlines: string[];
}

export default function LiveTicker({ headlines }: LiveTickerProps) {
    // Fallback if no headlines provided
    const items = headlines.length > 0 ? headlines : ["No breaking news at this time"];

    return (
        <div className={styles.container}>
            <div className={styles.label}>LIVE</div>
            <div className={styles.tickerWrapper}>
                <div className={styles.track}>
                    {items.map((item, i) => (
                        <span key={i} className={styles.item}>{item} <span className={styles.separator}>///</span></span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {items.map((item, i) => (
                        <span key={`dup-${i}`} className={styles.item}>{item} <span className={styles.separator}>///</span></span>
                    ))}
                </div>
            </div>
        </div>
    );
}
