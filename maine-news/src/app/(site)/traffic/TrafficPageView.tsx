import Image from 'next/image';
import Link from 'next/link';
import { Activity, ArrowUpRight, Clock3, MapPinned, Route, TriangleAlert } from 'lucide-react';
import { MAINE_TRAFFIC_MAP_BBOX, type TrafficIncident, type TrafficReport } from '@/lib/traffic';
import styles from './TrafficPageView.module.css';

function formatTimestamp(value?: string) {
    if (!value) return 'Updated moments ago';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Updated moments ago';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
    }).format(date);
}

function formatDelay(delaySeconds?: number) {
    if (!delaySeconds) return 'Minor slowdown';
    const minutes = Math.round(delaySeconds / 60);
    return minutes > 0 ? `${minutes} min delay` : 'Minor slowdown';
}

function formatLength(lengthMeters?: number) {
    if (!lengthMeters) return null;
    const miles = lengthMeters / 1609.34;
    return `${miles.toFixed(miles >= 10 ? 0 : 1)} mi`;
}

function formatProbability(value?: string) {
    if (!value) return 'Certain';
    return value.replaceAll('_', ' ');
}

function formatRoadLabel(roads: string[]) {
    if (!roads.length) return 'Local route';
    return roads.slice(0, 2).join(' / ');
}

function getSeverityTone(incident: TrafficIncident) {
    if (incident.magnitude === 'Indefinite') return styles.severityCritical;
    if (incident.magnitude === 'Major') return styles.severityMajor;
    if (incident.magnitude === 'Moderate') return styles.severityModerate;
    return styles.severityMinor;
}

function getMarkerPosition(incident: TrafficIncident) {
    if (!incident.coordinates) return null;

    const [lon, lat] = incident.coordinates;
    const left = ((lon - MAINE_TRAFFIC_MAP_BBOX.minLon) / (MAINE_TRAFFIC_MAP_BBOX.maxLon - MAINE_TRAFFIC_MAP_BBOX.minLon)) * 100;
    const top = ((MAINE_TRAFFIC_MAP_BBOX.maxLat - lat) / (MAINE_TRAFFIC_MAP_BBOX.maxLat - MAINE_TRAFFIC_MAP_BBOX.minLat)) * 100;

    return {
        left: `${Math.min(Math.max(left, 5), 95)}%`,
        top: `${Math.min(Math.max(top, 7), 93)}%`,
    };
}

export default function TrafficPageView({ report }: { report: TrafficReport }) {
    const mappedIncidents = report.incidents.filter((incident) => incident.coordinates).slice(0, 16);
    const featuredIncidents = report.incidents.slice(0, 6);
    const severeCount = report.incidents.filter((incident) => incident.magnitude === 'Major' || incident.magnitude === 'Indefinite').length;
    const totalDelayMinutes = report.incidents.reduce((total, incident) => total + Math.round((incident.delaySeconds || 0) / 60), 0);
    const busiestRegion = [...report.regions].sort((a, b) => b.incidentCount - a.incidentCount)[0];
    const corridorCounts = report.incidents.reduce<Map<string, number>>((acc, incident) => {
        for (const road of incident.roadNumbers) {
            acc.set(road, (acc.get(road) || 0) + 1);
        }
        return acc;
    }, new Map());
    const topCorridors = [...corridorCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
        <div className={styles.page}>
            <section className={styles.masthead}>
                <div className={styles.mastheadCopy}>
                    <p className={styles.kicker}>Live Maine traffic</p>
                    <h1 className={styles.title}>Road conditions and incidents statewide</h1>
                    <p className={styles.intro}>
                        A live statewide desk for closures, crashes, lane restrictions, and slow corridors. Use the map for a quick operational read, then drill into individual incidents below.
                    </p>
                </div>

                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Active incidents</span>
                        <strong className={styles.summaryValue}>{report.incidents.length}</strong>
                        <span className={styles.summaryMeta}>Current statewide count</span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>High severity</span>
                        <strong className={styles.summaryValue}>{severeCount}</strong>
                        <span className={styles.summaryMeta}>Major or indefinite alerts</span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Estimated delay</span>
                        <strong className={styles.summaryValue}>{totalDelayMinutes} min</strong>
                        <span className={styles.summaryMeta}>Combined reported delay</span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Busiest region</span>
                        <strong className={styles.summaryValue}>{busiestRegion?.label || 'Statewide'}</strong>
                        <span className={styles.summaryMeta}>{busiestRegion?.incidentCount || 0} active incidents</span>
                    </div>
                </div>
            </section>

            <section className={styles.metaBar}>
                <div className={styles.metaItem}>
                    <Clock3 size={15} />
                    <span>Updated {formatTimestamp(report.updatedAt)}</span>
                </div>
                <div className={styles.metaItem}>
                    <Activity size={15} />
                    <span>{report.configured ? 'TomTom live feed active' : 'Add TOMTOM_API_KEY to activate live traffic'}</span>
                </div>
                <Link href="/" className={styles.backLink}>
                    Home <ArrowUpRight size={14} />
                </Link>
            </section>

            <section className={styles.operationsGrid}>
                <div className={styles.mapPanel}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <MapPinned size={16} />
                            <div>
                                <h2>Statewide traffic map</h2>
                                <p>Static Maine overview with live incident markers</p>
                            </div>
                        </div>
                        <div className={styles.legend}>
                            <span><i className={`${styles.legendDot} ${styles.legendModerate}`} /> Moderate</span>
                            <span><i className={`${styles.legendDot} ${styles.legendMajor}`} /> Major</span>
                        </div>
                    </div>

                    <div className={styles.mapFrame}>
                        {report.configured ? (
                            <Image
                                src="/api/traffic/map"
                                alt="Statewide traffic map of Maine"
                                className={styles.mapImage}
                                fill
                                sizes="(max-width: 959px) 100vw, 70vw"
                                unoptimized
                            />
                        ) : (
                            <div className={styles.mapPlaceholder}>
                                <TriangleAlert size={22} />
                                <p>Traffic map will appear after `TOMTOM_API_KEY` is configured.</p>
                            </div>
                        )}

                        <div className={styles.mapScrim} />

                        {mappedIncidents.map((incident) => {
                            const position = getMarkerPosition(incident);
                            if (!position) return null;

                            return (
                                <a
                                    key={incident.id}
                                    href={`#incident-${incident.id}`}
                                    className={`${styles.mapMarker} ${getSeverityTone(incident)}`}
                                    style={position}
                                    aria-label={`${incident.category}: ${incident.description}`}
                                />
                            );
                        })}

                        <div className={styles.mapHud}>
                            <span>Coverage</span>
                            <strong>Southern, Central, Midcoast, Eastern, Northern Maine</strong>
                        </div>
                    </div>
                </div>

                <aside className={styles.deskPanel}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <Route size={16} />
                            <div>
                                <h2>Live desk</h2>
                                <p>Most urgent incidents right now</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.deskList}>
                        {featuredIncidents.length ? featuredIncidents.map((incident) => (
                            <a key={incident.id} href={`#incident-${incident.id}`} className={styles.deskItem}>
                                <div className={styles.deskMeta}>
                                    <span className={`${styles.severityPill} ${getSeverityTone(incident)}`}>{incident.magnitude}</span>
                                    <span>{incident.regionLabel}</span>
                                </div>
                                <h3>{incident.description}</h3>
                                <div className={styles.deskFooter}>
                                    <span>{formatRoadLabel(incident.roadNumbers)}</span>
                                    <span>{formatDelay(incident.delaySeconds)}</span>
                                </div>
                            </a>
                        )) : (
                            <div className={styles.emptyDesk}>
                                <p>No live incidents are available right now.</p>
                            </div>
                        )}
                    </div>
                </aside>
            </section>

            <section className={styles.insightGrid}>
                <div className={styles.regionPanel}>
                    <div className={styles.sectionHeading}>
                        <h2>Regional load</h2>
                        <span>Live by coverage zone</span>
                    </div>
                    <div className={styles.regionGrid}>
                        {report.regions.map((region) => (
                            <div key={region.id} className={styles.regionCard}>
                                <span className={styles.regionLabel}>{region.label}</span>
                                <strong className={styles.regionCount}>{region.incidentCount}</strong>
                                <span className={styles.regionMeta}>active alerts</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.corridorPanel}>
                    <div className={styles.sectionHeading}>
                        <h2>Top corridors</h2>
                        <span>Most-mentioned routes in the current feed</span>
                    </div>
                    {topCorridors.length ? (
                        <div className={styles.corridorList}>
                            {topCorridors.map(([road, count]) => (
                                <div key={road} className={styles.corridorItem}>
                                    <strong>{road}</strong>
                                    <span>{count} active mentions</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noticePanel}>
                            <p>Road identifiers will populate here as live incidents are reported.</p>
                        </div>
                    )}
                </div>
            </section>

            {report.note && (
                <section className={styles.noticePanel}>
                    <p>{report.note}</p>
                </section>
            )}

            <section className={styles.listSection}>
                <div className={styles.sectionHeading}>
                    <h2>Incident detail</h2>
                    <span>Operational incident cards sorted by severity and delay</span>
                </div>

                {report.incidents.length ? (
                    <div className={styles.incidentGrid}>
                        {report.incidents.map((incident) => (
                            <article key={incident.id} id={`incident-${incident.id}`} className={styles.incidentCard}>
                                <div className={styles.incidentTop}>
                                    <span className={`${styles.severityPill} ${getSeverityTone(incident)}`}>{incident.category}</span>
                                    <span className={styles.regionTag}>{incident.regionLabel}</span>
                                </div>

                                <h3 className={styles.incidentTitle}>
                                    {incident.description}
                                    {incident.to ? ` near ${incident.to}` : ''}
                                </h3>

                                <div className={styles.routeRow}>
                                    {incident.roadNumbers.length ? (
                                        incident.roadNumbers.map((road) => (
                                            <span key={`${incident.id}-${road}`} className={styles.routeChip}>{road}</span>
                                        ))
                                    ) : (
                                        <span className={styles.routeChip}>Local route</span>
                                    )}
                                </div>

                                <p className={styles.locationText}>
                                    {incident.from && incident.to ? `${incident.from} to ${incident.to}` : incident.from || incident.to || 'Location detail pending'}
                                </p>

                                <div className={styles.detailRow}>
                                    <span>{incident.magnitude}</span>
                                    <span>{formatDelay(incident.delaySeconds)}</span>
                                    {formatLength(incident.lengthMeters) && <span>{formatLength(incident.lengthMeters)}</span>}
                                </div>

                                <div className={styles.footerRow}>
                                    <span>{formatTimestamp(incident.lastReportTime || incident.startTime)}</span>
                                    <span>{formatProbability(incident.probabilityOfOccurrence)}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No live incidents are available right now.</p>
                        <p className={styles.emptyHint}>If your TomTom key is active, the statewide desk will refresh automatically.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
