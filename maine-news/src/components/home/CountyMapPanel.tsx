import dynamic from 'next/dynamic';
import { MapPinned } from 'lucide-react';
import styles from './CountyMapPanel.module.css';

const CountyMapPanelClient = dynamic(() => import('./CountyMapPanelClient'), {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Loading county map...</div>,
});

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
                <CountyMapPanelClient />
            </div>

            <div className={styles.footer}>
                <span>County pages surface the latest stories matched to that local area.</span>
            </div>
        </section>
    );
}
