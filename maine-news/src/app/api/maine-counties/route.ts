import { NextResponse } from 'next/server';

const COUNTY_GEOJSON_URL = 'https://gis.mcht.org/arcgis/rest/services/AdminPolitical/MEGIS_Boundary_Counties/MapServer/0/query?where=1%3D1&outFields=county&returnGeometry=true&f=geojson&outSR=4326';

export const revalidate = 86400;

export async function GET() {
    try {
        const response = await fetch(COUNTY_GEOJSON_URL, {
            next: { revalidate },
            headers: {
                accept: 'application/geo+json, application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Unable to load Maine county boundaries.' },
                { status: 502 }
            );
        }

        const data = await response.json();

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'Unable to load Maine county boundaries.' },
            { status: 502 }
        );
    }
}
