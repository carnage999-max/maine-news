'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GeoJsonObject } from 'geojson';
import type { GeoJSON as LeafletGeoJSON, Path, PathOptions } from 'leaflet';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { getCountySlugFromName } from '@/lib/maineCounties';
import styles from './CountyMapPanel.module.css';

type CountyFeatureProperties = {
    county?: string;
};

type CountyFeatureCollection = GeoJsonObject & {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        properties: CountyFeatureProperties;
        geometry: {
            type: string;
            coordinates: unknown;
        };
    }>;
};

const MAINE_BOUNDS: [[number, number], [number, number]] = [
    [42.85, -71.2],
    [47.6, -66.7],
];

const BASE_STYLE: PathOptions = {
    color: 'rgba(14, 16, 19, 0.92)',
    weight: 1.1,
    fillColor: '#178d17',
    fillOpacity: 0.82,
};

const HOVER_STYLE: PathOptions = {
    color: '#f7f7f4',
    weight: 1.6,
    fillColor: '#ef2b2d',
    fillOpacity: 0.92,
};

export default function CountyMapPanelClient() {
    const router = useRouter();
    const geoJsonRef = useRef<LeafletGeoJSON | null>(null);
    const [data, setData] = useState<CountyFeatureCollection | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadCountyMap() {
            try {
                const response = await fetch('/api/maine-counties', { cache: 'force-cache' });

                if (!response.ok) {
                    throw new Error('Unable to load county map.');
                }

                const json = await response.json() as CountyFeatureCollection;

                if (!cancelled) {
                    setData(json);
                    setError(false);
                }
            } catch {
                if (!cancelled) {
                    setError(true);
                }
            }
        }

        void loadCountyMap();

        return () => {
            cancelled = true;
        };
    }, []);

    const geoJsonLayer = useMemo(() => {
        if (!data) {
            return null;
        }

        return (
            <GeoJSON
                ref={geoJsonRef}
                data={data as GeoJsonObject}
                style={() => BASE_STYLE}
                onEachFeature={(feature, layer) => {
                    const countyName = feature.properties?.county?.trim();

                    if (!countyName) {
                        return;
                    }

                    const countySlug = getCountySlugFromName(countyName);
                    layer.bindTooltip(countyName, {
                        direction: 'center',
                        sticky: true,
                        className: styles.countyTooltip,
                    });

                    layer.on({
                        mouseover: () => {
                            const pathLayer = layer as Path;
                            pathLayer.setStyle(HOVER_STYLE);
                            pathLayer.bringToFront();
                        },
                        mouseout: () => {
                            geoJsonRef.current?.resetStyle(layer);
                        },
                        click: () => {
                            if (countySlug) {
                                router.push(`/county/${countySlug}`);
                            }
                        },
                    });
                }}
            />
        );
    }, [data, router]);

    if (error) {
        return (
            <div className={styles.mapState}>
                <p>County map unavailable right now.</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.mapState}>
                <p>Loading county boundaries...</p>
            </div>
        );
    }

    return (
        <div className={styles.mapCanvas}>
            <MapContainer
                bounds={MAINE_BOUNDS}
                boundsOptions={{ padding: [8, 8] }}
                maxBounds={MAINE_BOUNDS}
                maxBoundsViscosity={1}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                boxZoom={false}
                keyboard={false}
                dragging={false}
                touchZoom={false}
                attributionControl
                className={styles.leafletMap}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {geoJsonLayer}
            </MapContainer>
        </div>
    );
}
