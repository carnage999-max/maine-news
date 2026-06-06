import type { CountyFeature, CountyFeatureCollection } from '../services/api';

const COUNTY_SLUGS: Record<string, string> = {
    aroostook: 'aroostook',
    washington: 'washington',
    penobscot: 'penobscot',
    hancock: 'hancock',
    piscataquis: 'piscataquis',
    somerset: 'somerset',
    franklin: 'franklin',
    oxford: 'oxford',
    androscoggin: 'androscoggin',
    kennebec: 'kennebec',
    waldo: 'waldo',
    knox: 'knox',
    lincoln: 'lincoln',
    sagadahoc: 'sagadahoc',
    cumberland: 'cumberland',
    york: 'york',
};

function getCountySlug(name?: string) {
    if (!name) return null;
    return COUNTY_SLUGS[name.trim().toLowerCase()] || null;
}

function flattenCoordinates(feature: CountyFeature) {
    if (feature.geometry.type === 'Polygon') {
        return feature.geometry.coordinates.flat(1) as number[][];
    }
    return feature.geometry.coordinates.flat(2) as number[][];
}

export function buildCountyPaths(collection: CountyFeatureCollection, widthValue: number, heightValue: number) {
    const allPoints = collection.features.flatMap(flattenCoordinates);
    const longitudes = allPoints.map((point) => point[0]);
    const latitudes = allPoints.map((point) => point[1]);

    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const lonSpan = maxLon - minLon || 1;
    const latSpan = maxLat - minLat || 1;

    const padding = 12;
    const usableWidth = widthValue - padding * 2;
    const usableHeight = heightValue - padding * 2;

    const scalePoint = ([lon, lat]: number[]) => {
        const x = padding + ((lon - minLon) / lonSpan) * usableWidth;
        const y = padding + (1 - (lat - minLat) / latSpan) * usableHeight;
        return [x, y] as const;
    };

    return collection.features.map((feature) => {
        const polygons = feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates as number[][][]]
            : (feature.geometry.coordinates as number[][][][]);

        const path = polygons.map((polygon) => polygon.map((ring) => {
            return ring.map((point, index) => {
                const [x, y] = scalePoint(point);
                return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
            }).join(' ') + ' Z';
        }).join(' ')).join(' ');

        return {
            path,
            name: feature.properties.county || 'County',
            slug: getCountySlug(feature.properties.county),
        };
    });
}
