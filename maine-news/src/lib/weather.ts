import { unstable_cache } from 'next/cache';

const NWS_HEADERS = {
    'User-Agent': 'MaineNewsNow/1.0 (info@mainenewsnow.com)',
    'Accept': 'application/geo+json',
};

const REGION_POINTS = [
    { id: 'statewide', label: 'Statewide', location: 'Augusta, Maine', lat: 44.3106, lon: -69.7795 },
    { id: 'northern', label: 'Northern Maine', location: 'Presque Isle, Maine', lat: 46.6812, lon: -68.0159 },
    { id: 'central', label: 'Central Maine', location: 'Bangor, Maine', lat: 44.8012, lon: -68.7778 },
    { id: 'southern', label: 'Southern / Coastal Maine', location: 'Portland, Maine', lat: 43.6591, lon: -70.2568 },
];

export interface ForecastSlice {
    name: string;
    shortForecast: string;
    detailedForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    windSpeed?: string;
    windDirection?: string;
    precipitationChance?: number | null;
    icon?: string;
}

export interface HourlyForecast {
    startTime: string;
    displayTime: string;
    shortForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    windSpeed?: string;
    windDirection?: string;
    precipitationChance?: number | null;
    icon?: string;
}

export interface OutlookDay {
    name: string;
    shortForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    precipitationChance?: number | null;
    icon?: string;
}

export interface WeatherMetrics {
    temperature?: number;
    temperatureUnit?: string;
    feelsLike?: number;
    humidity?: number;
    windSpeed?: number;
    windGust?: number;
    windDirection?: number;
    pressure?: number;
    visibility?: number;
    uvIndex?: number;
    precipitationToday?: number;
    sunrise?: string;
    sunset?: string;
    airQualityIndex?: number;
}

export interface RegionForecast {
    id: string;
    label: string;
    location: string;
    status: 'ok' | 'error';
    errorMessage?: string;
    today?: ForecastSlice;
    tonight?: ForecastSlice;
    tomorrow?: ForecastSlice;
    hourly: HourlyForecast[];
    outlook: OutlookDay[];
    metrics?: WeatherMetrics;
}

export interface WeatherAlert {
    id: string;
    event: string;
    headline: string;
    severity: string;
    description: string;
    effective?: string;
    ends?: string;
}

export interface WeatherReport {
    date: string;
    displayDate: string;
    generatedAt: string;
    permalinkPath: string;
    source: string;
    regions: RegionForecast[];
    alerts: WeatherAlert[];
}

interface NwsPointResponse {
    properties: {
        forecast: string;
        forecastHourly?: string;
        relativeLocation?: {
            properties?: {
                city?: string;
                state?: string;
            };
        };
    };
}

interface NwsForecastPeriod {
    name: string;
    startTime: string;
    isDaytime: boolean;
    temperature: number;
    temperatureUnit: string;
    windSpeed: string;
    windDirection: string;
    shortForecast: string;
    detailedForecast: string;
    icon?: string;
    probabilityOfPrecipitation?: { value: number | null };
}

interface NwsForecastResponse {
    properties: {
        periods: NwsForecastPeriod[];
    };
}

interface NwsAlertsResponse {
    features: Array<{
        id: string;
        properties: {
            event: string;
            headline: string;
            severity: string;
            description: string;
            effective?: string;
            ends?: string;
        };
    }>;
}

interface OpenMeteoForecastResponse {
    current?: {
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        wind_speed_10m?: number;
        wind_gusts_10m?: number;
        wind_direction_10m?: number;
        surface_pressure?: number;
        visibility?: number;
        precipitation?: number;
    };
    daily?: {
        sunrise?: string[];
        sunset?: string[];
        uv_index_max?: number[];
        precipitation_sum?: number[];
    };
}

interface OpenMeteoAirQualityResponse {
    current?: {
        us_aqi?: number;
    };
    hourly?: {
        us_aqi?: Array<number | null>;
    };
}

export function getMaineDateString(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

export function isValidDateParam(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatMaineDisplayDate(dateString: string): string {
    const safeDate = new Date(`${dateString}T12:00:00Z`);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(safeDate);
}

function formatMaineTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    }).format(date);
}

function formatClockTime(value?: string) {
    if (!value) return undefined;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;

    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

async function fetchJson<T>(
    url: string,
    revalidateSeconds = 1800,
    headers?: Record<string, string>
): Promise<T> {
    const response = await fetch(url, {
        headers,
        next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

function toForecastSlice(period?: NwsForecastPeriod): ForecastSlice | undefined {
    if (!period) return undefined;

    return {
        name: period.name,
        shortForecast: period.shortForecast,
        detailedForecast: period.detailedForecast,
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        precipitationChance: period.probabilityOfPrecipitation?.value ?? null,
        icon: period.icon,
    };
}

function toHourlyForecast(period: NwsForecastPeriod): HourlyForecast {
    return {
        startTime: period.startTime,
        displayTime: formatClockTime(period.startTime) || period.name,
        shortForecast: period.shortForecast,
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        precipitationChance: period.probabilityOfPrecipitation?.value ?? null,
        icon: period.icon,
    };
}

function buildOutlook(periods: NwsForecastPeriod[]): OutlookDay[] {
    return periods
        .filter(period => period.isDaytime)
        .slice(0, 7)
        .map(period => ({
            name: period.name,
            shortForecast: period.shortForecast,
            temperature: period.temperature,
            temperatureUnit: period.temperatureUnit,
            precipitationChance: period.probabilityOfPrecipitation?.value ?? null,
            icon: period.icon,
        }));
}

function pickForecastSlices(periods: NwsForecastPeriod[], hourlyPeriods: NwsForecastPeriod[]) {
    const today = periods[0];
    const tonightIndex = periods.findIndex((period, index) => index > 0 && period.name.toLowerCase().includes('tonight'));
    const fallbackTonight = periods.find((period, index) => index > 0 && !period.isDaytime);
    const tonight = tonightIndex >= 0 ? periods[tonightIndex] : fallbackTonight;

    const tomorrowStartIndex = tonightIndex >= 0 ? tonightIndex + 1 : 1;
    const tomorrow = periods.slice(tomorrowStartIndex).find(period => period.isDaytime) || periods[tomorrowStartIndex];

    return {
        today: toForecastSlice(today),
        tonight: toForecastSlice(tonight),
        tomorrow: toForecastSlice(tomorrow),
        hourly: hourlyPeriods.slice(0, 12).map(toHourlyForecast),
        outlook: buildOutlook(periods),
    };
}

async function fetchForecastForPoint(lat: number, lon: number) {
    const pointData = await fetchJson<NwsPointResponse>(`https://api.weather.gov/points/${lat},${lon}`, 1800, NWS_HEADERS);
    const forecastUrl = pointData.properties.forecast;
    const forecastHourlyUrl = pointData.properties.forecastHourly;
    const [forecastData, hourlyData] = await Promise.all([
        fetchJson<NwsForecastResponse>(forecastUrl, 1800, NWS_HEADERS),
        forecastHourlyUrl
            ? fetchJson<NwsForecastResponse>(forecastHourlyUrl, 1800, NWS_HEADERS).catch(() => ({ properties: { periods: [] } }))
            : Promise.resolve({ properties: { periods: [] } }),
    ]);

    return {
        periods: forecastData.properties.periods || [],
        hourlyPeriods: hourlyData.properties.periods || [],
    };
}

async function fetchOpenMeteoMetrics(lat: number, lon: number): Promise<WeatherMetrics> {
    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.searchParams.set('latitude', String(lat));
    forecastUrl.searchParams.set('longitude', String(lon));
    forecastUrl.searchParams.set('timezone', 'America/New_York');
    forecastUrl.searchParams.set(
        'current',
        [
            'temperature_2m',
            'apparent_temperature',
            'relative_humidity_2m',
            'wind_speed_10m',
            'wind_gusts_10m',
            'wind_direction_10m',
            'surface_pressure',
            'visibility',
            'precipitation',
        ].join(',')
    );
    forecastUrl.searchParams.set(
        'daily',
        ['sunrise', 'sunset', 'uv_index_max', 'precipitation_sum'].join(',')
    );
    forecastUrl.searchParams.set('temperature_unit', 'fahrenheit');
    forecastUrl.searchParams.set('wind_speed_unit', 'mph');
    forecastUrl.searchParams.set('precipitation_unit', 'inch');
    forecastUrl.searchParams.set('visibility_unit', 'mile');
    forecastUrl.searchParams.set('forecast_days', '7');

    const forecast = await fetchJson<OpenMeteoForecastResponse>(forecastUrl.toString(), 1800);

    const metrics: WeatherMetrics = {
        temperature: forecast.current?.temperature_2m,
        temperatureUnit: 'F',
        feelsLike: forecast.current?.apparent_temperature,
        humidity: forecast.current?.relative_humidity_2m,
        windSpeed: forecast.current?.wind_speed_10m,
        windGust: forecast.current?.wind_gusts_10m,
        windDirection: forecast.current?.wind_direction_10m,
        pressure: forecast.current?.surface_pressure,
        visibility: forecast.current?.visibility,
        uvIndex: forecast.daily?.uv_index_max?.[0],
        precipitationToday: forecast.daily?.precipitation_sum?.[0] ?? forecast.current?.precipitation,
        sunrise: formatClockTime(forecast.daily?.sunrise?.[0]),
        sunset: formatClockTime(forecast.daily?.sunset?.[0]),
    };

    try {
        const airUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
        airUrl.searchParams.set('latitude', String(lat));
        airUrl.searchParams.set('longitude', String(lon));
        airUrl.searchParams.set('timezone', 'America/New_York');
        airUrl.searchParams.set('current', 'us_aqi');

        const air = await fetchJson<OpenMeteoAirQualityResponse>(airUrl.toString(), 1800);
        metrics.airQualityIndex = air.current?.us_aqi ?? air.hourly?.us_aqi?.[0] ?? undefined;
    } catch {
        metrics.airQualityIndex = undefined;
    }

    return metrics;
}

async function fetchAlerts(): Promise<WeatherAlert[]> {
    const alertData = await fetchJson<NwsAlertsResponse>('https://api.weather.gov/alerts/active?area=ME', 600, NWS_HEADERS);

    return (alertData.features || []).map(feature => ({
        id: feature.id,
        event: feature.properties.event,
        headline: feature.properties.headline,
        severity: feature.properties.severity,
        description: feature.properties.description,
        effective: feature.properties.effective,
        ends: feature.properties.ends,
    }));
}

export async function getWeatherReport(date: string, revalidateSeconds = 3600): Promise<WeatherReport> {
    const cacheKey = ['weather-report', date, String(revalidateSeconds)];
    const cached = unstable_cache(async () => {
        const [alerts, regions] = await Promise.all([
            fetchAlerts().catch(() => []),
            Promise.all(REGION_POINTS.map(async (region) => {
                try {
                    const [forecast, metrics] = await Promise.all([
                        fetchForecastForPoint(region.lat, region.lon),
                        fetchOpenMeteoMetrics(region.lat, region.lon).catch(() => ({})),
                    ]);

                    const slices = pickForecastSlices(forecast.periods, forecast.hourlyPeriods);

                    return {
                        id: region.id,
                        label: region.label,
                        location: region.location,
                        status: 'ok' as const,
                        today: slices.today,
                        tonight: slices.tonight,
                        tomorrow: slices.tomorrow,
                        hourly: slices.hourly,
                        outlook: slices.outlook,
                        metrics,
                    };
                } catch (error) {
                    console.error(`Failed to load forecast for ${region.label}:`, error);
                    return {
                        id: region.id,
                        label: region.label,
                        location: region.location,
                        status: 'error' as const,
                        errorMessage: 'Weather data is temporarily unavailable.',
                        hourly: [],
                        outlook: [],
                    };
                }
            })),
        ]);

        return {
            date,
            displayDate: formatMaineDisplayDate(date),
            generatedAt: formatMaineTime(new Date()),
            permalinkPath: `/weather/${date}`,
            source: 'Forecast data sourced from the National Weather Service (NOAA) with supplemental hourly and atmospheric detail from Open-Meteo.',
            regions,
            alerts,
        };
    }, cacheKey, { revalidate: revalidateSeconds });

    return cached();
}
