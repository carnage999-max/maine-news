interface TrafficEvent {
    description?: string;
    code?: number;
    iconCategory?: number;
}

interface TrafficIncidentProperties {
    id?: string;
    iconCategory?: number;
    magnitudeOfDelay?: number;
    events?: TrafficEvent[];
    startTime?: string;
    endTime?: string;
    from?: string;
    to?: string;
    length?: number;
    delay?: number;
    roadNumbers?: string[];
    probabilityOfOccurrence?: string;
    lastReportTime?: string;
}

interface TrafficIncidentGeometry {
    type?: string;
    coordinates?: Array<[number, number]> | [number, number];
}

interface TrafficIncidentFeature {
    geometry?: TrafficIncidentGeometry;
    properties?: TrafficIncidentProperties;
}

interface TomTomIncidentResponse {
    incidents?: TrafficIncidentFeature[];
}

export interface TrafficRegionSummary {
    id: string;
    label: string;
    incidentCount: number;
}

export interface TrafficIncident {
    id: string;
    regionId: string;
    regionLabel: string;
    category: string;
    description: string;
    magnitude: string;
    iconCategory: number;
    from?: string;
    to?: string;
    delaySeconds?: number;
    lengthMeters?: number;
    roadNumbers: string[];
    startTime?: string;
    endTime?: string;
    lastReportTime?: string;
    probabilityOfOccurrence?: string;
    coordinates?: [number, number];
}

export interface TrafficReport {
    configured: boolean;
    source: 'tomtom' | 'unconfigured' | 'error';
    updatedAt: string;
    note?: string;
    incidents: TrafficIncident[];
    regions: TrafficRegionSummary[];
}

const TOMTOM_INCIDENT_FIELDS = '{incidents{geometry{coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},from,to,length,delay,roadNumbers,startTime,endTime,probabilityOfOccurrence,lastReportTime}}}';

export const MAINE_TRAFFIC_MAP_BBOX = {
    minLon: -71.2,
    minLat: 42.95,
    maxLon: -66.75,
    maxLat: 47.55,
} as const;

const TRAFFIC_REGIONS = [
    { id: 'southern', label: 'Southern Maine', bbox: '-70.95,43.25,-70.05,43.85' },
    { id: 'central', label: 'Central Maine', bbox: '-70.10,43.85,-69.10,44.50' },
    { id: 'midcoast', label: 'Midcoast Maine', bbox: '-69.95,43.55,-68.80,44.20' },
    { id: 'eastern', label: 'Eastern Maine', bbox: '-69.15,44.63,-68.30,45.05' },
    { id: 'northern', label: 'Northern Maine', bbox: '-68.35,46.45,-67.45,47.05' },
];

const ICON_CATEGORY_LABELS: Record<number, string> = {
    0: 'Unknown',
    1: 'Accident',
    2: 'Fog',
    3: 'Dangerous conditions',
    4: 'Rain',
    5: 'Ice',
    6: 'Jam',
    7: 'Lane closed',
    8: 'Road closed',
    9: 'Road works',
    10: 'Wind',
    11: 'Flooding',
    14: 'Broken down vehicle',
};

const MAGNITUDE_LABELS: Record<number, string> = {
    0: 'Unknown',
    1: 'Minor',
    2: 'Moderate',
    3: 'Major',
    4: 'Indefinite',
};

function incidentCategoryLabel(iconCategory?: number) {
    return ICON_CATEGORY_LABELS[iconCategory ?? 0] || 'Traffic alert';
}

function incidentMagnitudeLabel(magnitude?: number) {
    return MAGNITUDE_LABELS[magnitude ?? 0] || 'Unknown';
}

function pickCoordinates(geometry?: TrafficIncidentGeometry): [number, number] | undefined {
    if (!geometry?.coordinates) return undefined;

    if (Array.isArray(geometry.coordinates) && typeof geometry.coordinates[0] === 'number') {
        return geometry.coordinates as [number, number];
    }

    if (Array.isArray(geometry.coordinates) && Array.isArray(geometry.coordinates[0])) {
        return geometry.coordinates[0] as [number, number];
    }

    return undefined;
}

async function fetchRegionIncidents(region: typeof TRAFFIC_REGIONS[number], apiKey: string, revalidateSeconds: number): Promise<TrafficIncident[]> {
    const url = new URL('https://api.tomtom.com/traffic/services/5/incidentDetails');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('bbox', region.bbox);
    url.searchParams.set('fields', TOMTOM_INCIDENT_FIELDS);
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('timeValidityFilter', 'present');

    const response = await fetch(url.toString(), {
        next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) {
        throw new Error(`TomTom request failed for ${region.id}: ${response.status}`);
    }

    const payload = await response.json() as TomTomIncidentResponse;
    const incidents: Array<TrafficIncident | null> = (payload.incidents || [])
        .map((incident) => {
            const props = incident.properties;
            if (!props?.id) return null;

            return {
                id: props.id,
                regionId: region.id,
                regionLabel: region.label,
                category: incidentCategoryLabel(props.iconCategory),
                description: props.events?.[0]?.description || incidentCategoryLabel(props.iconCategory),
                magnitude: incidentMagnitudeLabel(props.magnitudeOfDelay),
                iconCategory: props.iconCategory ?? 0,
                from: props.from,
                to: props.to,
                delaySeconds: props.delay,
                lengthMeters: props.length,
                roadNumbers: props.roadNumbers || [],
                startTime: props.startTime,
                endTime: props.endTime,
                lastReportTime: props.lastReportTime,
                probabilityOfOccurrence: props.probabilityOfOccurrence,
                coordinates: pickCoordinates(incident.geometry),
            } satisfies TrafficIncident;
        });

    return incidents.filter((incident): incident is TrafficIncident => incident !== null);
}

function compareIncidents(a: TrafficIncident, b: TrafficIncident) {
    const magnitudeRank = { Unknown: 0, Minor: 1, Moderate: 2, Major: 3, Indefinite: 4 };
    const aMagnitude = magnitudeRank[a.magnitude as keyof typeof magnitudeRank] ?? 0;
    const bMagnitude = magnitudeRank[b.magnitude as keyof typeof magnitudeRank] ?? 0;

    if (aMagnitude !== bMagnitude) return bMagnitude - aMagnitude;

    const aDelay = a.delaySeconds ?? 0;
    const bDelay = b.delaySeconds ?? 0;
    if (aDelay !== bDelay) return bDelay - aDelay;

    const aUpdated = a.lastReportTime ? new Date(a.lastReportTime).getTime() : 0;
    const bUpdated = b.lastReportTime ? new Date(b.lastReportTime).getTime() : 0;
    return bUpdated - aUpdated;
}

export async function getTrafficReport(revalidateSeconds = 60): Promise<TrafficReport> {
    const apiKey = process.env.TOMTOM_API_KEY;

    if (!apiKey) {
        return {
            configured: false,
            source: 'unconfigured',
            updatedAt: new Date().toISOString(),
            note: 'Add TOMTOM_API_KEY to enable live TomTom traffic incidents.',
            incidents: [],
            regions: TRAFFIC_REGIONS.map((region) => ({
                id: region.id,
                label: region.label,
                incidentCount: 0,
            })),
        };
    }

    try {
        const regionResponses = await Promise.all(
            TRAFFIC_REGIONS.map(async (region) => ({
                region,
                incidents: await fetchRegionIncidents(region, apiKey, revalidateSeconds),
            }))
        );

        const incidentMap = new Map<string, TrafficIncident>();

        for (const { incidents } of regionResponses) {
            for (const incident of incidents) {
                const existing = incidentMap.get(incident.id);
                if (!existing || compareIncidents(incident, existing) < 0) {
                    incidentMap.set(incident.id, incident);
                }
            }
        }

        return {
            configured: true,
            source: 'tomtom',
            updatedAt: new Date().toISOString(),
            incidents: Array.from(incidentMap.values()).sort(compareIncidents),
            regions: regionResponses.map(({ region, incidents }) => ({
                id: region.id,
                label: region.label,
                incidentCount: incidents.length,
            })),
        };
    } catch (error) {
        console.error('Failed to load TomTom traffic incidents:', error);
        return {
            configured: true,
            source: 'error',
            updatedAt: new Date().toISOString(),
            note: 'TomTom traffic data is temporarily unavailable.',
            incidents: [],
            regions: TRAFFIC_REGIONS.map((region) => ({
                id: region.id,
                label: region.label,
                incidentCount: 0,
            })),
        };
    }
}
