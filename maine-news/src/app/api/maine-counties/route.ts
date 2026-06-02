import { NextResponse } from 'next/server';
import { MAINE_COUNTIES_GEOJSON } from '@/data/maine-counties.geojson';

const COUNTY_GEOJSON_URL = 'https://gis.mcht.org/arcgis/rest/services/AdminPolitical/MEGIS_Boundary_Counties/MapServer/0/query?where=1%3D1&outFields=county&returnGeometry=true&f=geojson&outSR=4326';

export const revalidate = 86400;
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(COUNTY_GEOJSON_URL, {
            cache: 'no-store',
            headers: {
                accept: 'application/geo+json, application/json',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data, {
                headers: {
                    'X-Maine-County-Source': 'live',
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
                },
            });
        }

        // External service failed, use fallback
        console.warn(`MEGIS boundary service returned ${response.status}, using fallback data`);
        return NextResponse.json(MAINE_COUNTIES_GEOJSON, {
            headers: {
                'X-Maine-County-Source': 'fallback',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        // Network error, timeout, or other issue - use fallback
        console.warn('Failed to fetch MEGIS boundary data, using fallback:', error);
        return NextResponse.json(MAINE_COUNTIES_GEOJSON, {
            headers: {
                'X-Maine-County-Source': 'fallback',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
            },
        });
    }
}
