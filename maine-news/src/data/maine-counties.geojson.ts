// Simplified Maine county boundaries as GeoJSON
// These are approximate geometries for fallback purposes
export const MAINE_COUNTIES_GEOJSON = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { county: 'Aroostook' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-69.977, 47.464],
                        [-67.5, 47.464],
                        [-67.5, 45.562],
                        [-69.977, 45.562],
                        [-69.977, 47.464],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Washington' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-67.5, 45.562],
                        [-67.0, 45.562],
                        [-67.0, 44.8],
                        [-67.5, 44.8],
                        [-67.5, 45.562],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Piscataquis' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-71.0, 45.562],
                        [-69.5, 45.562],
                        [-69.5, 44.9],
                        [-71.0, 44.9],
                        [-71.0, 45.562],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Penobscot' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-69.5, 45.562],
                        [-68.3, 45.562],
                        [-68.3, 44.8],
                        [-69.5, 44.8],
                        [-69.5, 45.562],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Hancock' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-68.3, 45.0],
                        [-67.7, 45.0],
                        [-67.7, 44.0],
                        [-68.3, 44.0],
                        [-68.3, 45.0],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Somerset' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-71.0, 44.9],
                        [-69.5, 44.9],
                        [-69.5, 44.0],
                        [-71.0, 44.0],
                        [-71.0, 44.9],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Franklin' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-71.5, 44.9],
                        [-71.0, 44.9],
                        [-71.0, 44.0],
                        [-71.5, 44.0],
                        [-71.5, 44.9],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Oxford' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-72.0, 44.4],
                        [-71.0, 44.4],
                        [-71.0, 43.4],
                        [-72.0, 43.4],
                        [-72.0, 44.4],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Androscoggin' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-71.0, 44.4],
                        [-70.4, 44.4],
                        [-70.4, 43.8],
                        [-71.0, 43.8],
                        [-71.0, 44.4],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Kennebec' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-70.4, 44.4],
                        [-69.5, 44.4],
                        [-69.5, 43.8],
                        [-70.4, 43.8],
                        [-70.4, 44.4],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Waldo' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-69.5, 44.4],
                        [-68.8, 44.4],
                        [-68.8, 43.9],
                        [-69.5, 43.9],
                        [-69.5, 44.4],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Knox' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-69.1, 44.2],
                        [-68.8, 44.2],
                        [-68.8, 43.8],
                        [-69.1, 43.8],
                        [-69.1, 44.2],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Lincoln' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-69.5, 43.9],
                        [-69.1, 43.9],
                        [-69.1, 43.6],
                        [-69.5, 43.6],
                        [-69.5, 43.9],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Sagadahoc' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-70.0, 43.9],
                        [-69.5, 43.9],
                        [-69.5, 43.6],
                        [-70.0, 43.6],
                        [-70.0, 43.9],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'Cumberland' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-70.5, 43.6],
                        [-70.0, 43.6],
                        [-70.0, 43.1],
                        [-70.5, 43.1],
                        [-70.5, 43.6],
                    ],
                ],
            },
        },
        {
            type: 'Feature',
            properties: { county: 'York' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-71.2, 43.3],
                        [-70.5, 43.3],
                        [-70.5, 42.85],
                        [-71.2, 42.85],
                        [-71.2, 43.3],
                    ],
                ],
            },
        },
    ],
};
