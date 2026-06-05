import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get the dev machine IP for physical device testing
const getApiBaseUrl = () => {
    // Change this to true if you want to test against your local Next.js server
    const USE_LOCAL_BACKEND = false;

    if (__DEV__ && USE_LOCAL_BACKEND) {
        const debuggerHost = Constants.expoConfig?.hostUri || '';
        const localhost = debuggerHost.split(':')[0];
        if (localhost) {
            return `http://${localhost}:3000`;
        }
    }

    // Default to the live production server
    return 'https://mainenewsnow.com';
};

export const API_BASE_URL = getApiBaseUrl();

export interface Post {
    slug: string;
    title: string;
    author: string;
    category: string;
    publishedDate: string;
    image?: string;
    excerpt?: string;
    content?: string;
    isOriginal?: boolean;
    isNational?: boolean;
}

export interface ForecastSlice {
    name: string;
    shortForecast: string;
    detailedForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    windSpeed?: string;
    windDirection?: string;
    precipitationChance?: number | null;
}

export interface OutlookDay {
    name: string;
    shortForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    precipitationChance?: number | null;
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
    outlook: OutlookDay[];
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

export interface LotteryDraw {
    game: string;
    numbers: string[];
    extra?: string | null;
    jackpot?: string | null;
    date?: string | null;
    source?: string;
}

export interface LotterySummary {
    powerball?: LotteryDraw | null;
    megamillions?: LotteryDraw | null;
    luckyForLife?: LotteryDraw | null;
    lottoAmerica?: LotteryDraw | null;
    doublePlay?: LotteryDraw | null;
    megabucks?: LotteryDraw | null;
    gimme5?: LotteryDraw | null;
    pick4?: LotteryDraw | null;
    pick3?: LotteryDraw | null;
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

export interface NewsroomProfile {
    id: string;
    name: string;
    role: string;
    avatar?: string | null;
    bio?: string | null;
    email?: string | null;
    contactInfo?: string | null;
}

export interface CountyFeatureProperties {
    county?: string;
}

export interface CountyGeometry {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
}

export interface CountyFeature {
    type: 'Feature';
    properties: CountyFeatureProperties;
    geometry: CountyGeometry;
}

export interface CountyFeatureCollection {
    type: 'FeatureCollection';
    features: CountyFeature[];
}

export interface CountySummary {
    slug: string;
    name: string;
}

export interface CountyFeedResponse {
    county: CountySummary;
    posts: Post[];
}

export interface MaineMinuteLink {
    title: string;
    slug: string;
}

export interface MaineMinuteSection {
    title: string;
    summary: string;
    links: MaineMinuteLink[];
}

export interface MaineMinuteLotteryEntry {
    game: string;
    numbers: string[];
    extra?: string | null;
    jackpot?: string | null;
    drawDate?: string | null;
}

export interface MaineMinuteReport {
    date: string;
    headline: string;
    subhead: string;
    sections: MaineMinuteSection[];
    readMore: MaineMinuteLink[];
    lottery: MaineMinuteLotteryEntry[];
    timestamp: string;
    isManual: boolean;
}

export const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
};

export interface ApiResponse {
    posts: Post[];
    count: number;
}

// Fetch all posts
export async function fetchPosts(): Promise<Post[]> {
    try {
        const response = await axios.get<any>(`${API_BASE_URL}/api/posts`);
        const data = response.data;

        // Handle both old array format and new { posts: [] } format
        let posts: Post[] = [];
        if (Array.isArray(data)) {
            posts = data;
        } else if (data && Array.isArray(data.posts)) {
            posts = data.posts;
        }

        // Cache posts for offline mode
        await AsyncStorage.setItem('cached_posts', JSON.stringify(posts));

        return posts;
    } catch (error) {
        console.error('Failed to fetch posts:', error);

        // Try to load from cache
        const cached = await AsyncStorage.getItem('cached_posts');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                return Array.isArray(data) ? data : (data.posts || []);
            } catch (e) {
                return [];
            }
        }

        return [];
    }
}

export async function fetchWeatherReport(date?: string): Promise<WeatherReport | null> {
    const cacheKey = date ? `cached_weather_report_${date}` : 'cached_weather_report_latest';
    const url = date ? `${API_BASE_URL}/api/weather?date=${date}` : `${API_BASE_URL}/api/weather`;

    try {
        const response = await axios.get<WeatherReport>(url);
        const report = response.data;
        if (report) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(report));
        }
        return report || null;
    } catch (error) {
        console.error('Failed to fetch weather report:', error);

        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as WeatherReport;
            } catch (e) {
                return null;
            }
        }

        return null;
    }
}

export async function fetchLotterySummary(): Promise<LotterySummary | null> {
    const cacheKey = 'cached_lottery_summary';

    try {
        const response = await axios.get<LotterySummary>(`${API_BASE_URL}/api/lottery`);
        const summary = response.data;
        if (summary) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(summary));
        }
        return summary || null;
    } catch (error) {
        console.error('Failed to fetch lottery summary:', error);
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as LotterySummary;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

export async function fetchTrafficReport(): Promise<TrafficReport | null> {
    const cacheKey = 'cached_traffic_report';

    try {
        const response = await axios.get<TrafficReport>(`${API_BASE_URL}/api/traffic`);
        const report = response.data;
        if (report) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(report));
        }
        return report || null;
    } catch (error) {
        console.error('Failed to fetch traffic report:', error);
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as TrafficReport;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

export async function fetchNewsroomProfiles(): Promise<NewsroomProfile[]> {
    const cacheKey = 'cached_newsroom_profiles';

    try {
        const response = await axios.get<{ authors: NewsroomProfile[] }>(`${API_BASE_URL}/api/authors`);
        const profiles = response.data.authors || [];
        await AsyncStorage.setItem(cacheKey, JSON.stringify(profiles));
        return profiles;
    } catch (error) {
        console.error('Failed to fetch newsroom profiles:', error);
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as NewsroomProfile[];
            } catch (e) {
                return [];
            }
        }
        return [];
    }
}

export async function fetchCountyMap(): Promise<CountyFeatureCollection | null> {
    const cacheKey = 'cached_county_map';

    try {
        const response = await axios.get<CountyFeatureCollection>(`${API_BASE_URL}/api/maine-counties`);
        const map = response.data;
        if (map) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(map));
        }
        return map || null;
    } catch (error) {
        console.error('Failed to fetch county map:', error);
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as CountyFeatureCollection;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

export async function fetchCountyFeed(county: string): Promise<CountyFeedResponse | null> {
    const cacheKey = `cached_county_feed_${county}`;

    try {
        const response = await axios.get<CountyFeedResponse>(`${API_BASE_URL}/api/county/${county}`);
        const feed = response.data;
        if (feed) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(feed));
        }
        return feed || null;
    } catch (error) {
        console.error(`Failed to fetch county feed for ${county}:`, error);
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as CountyFeedResponse;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

export async function fetchMaineMinuteReport(date?: string): Promise<MaineMinuteReport | null> {
    const cacheKey = date ? `cached_maine_minute_${date}` : 'cached_maine_minute_latest';
    const url = date ? `${API_BASE_URL}/api/maine-minute?date=${date}` : `${API_BASE_URL}/api/maine-minute`;

    try {
        const response = await axios.get<MaineMinuteReport>(url);
        const report = response.data;
        if (report) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(report));
        }
        return report || null;
    } catch (error) {
        console.error('Failed to fetch Maine Minute report:', error);
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached) as MaineMinuteReport;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

// Fetch single post with content
export async function fetchPostBySlug(slug: string): Promise<any> {
    const cacheKey = `cached_article_${slug}`;
    const slugsKey = 'cached_article_slugs';

    try {
        const response = await axios.get(`${API_BASE_URL}/api/posts?slug=${slug}`);
        const postData = response.data;

        // Cache the full article
        if (postData) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify(postData));

            // Manage the list of last 10 cached articles
            const currentSlugsJson = await AsyncStorage.getItem(slugsKey);
            let currentSlugs: string[] = currentSlugsJson ? JSON.parse(currentSlugsJson) : [];

            // Remove if already exists (to move to front)
            currentSlugs = currentSlugs.filter(s => s !== slug);
            // Add to front
            currentSlugs.unshift(slug);

            // Keep only top 10
            if (currentSlugs.length > 10) {
                const slugsToRemove = currentSlugs.slice(10);
                for (const s of slugsToRemove) {
                    await AsyncStorage.removeItem(`cached_article_${s}`);
                }
                currentSlugs = currentSlugs.slice(0, 10);
            }

            await AsyncStorage.setItem(slugsKey, JSON.stringify(currentSlugs));
        }

        return postData;
    } catch (error) {
        console.error(`Failed to fetch post ${slug}:`, error);

        // Try to load from cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            console.log(`Loading ${slug} from offline cache`);
            return JSON.parse(cached);
        }

        return null;
    }
}

// Search posts
export function searchPosts(posts: Post[], query: string): Post[] {
    const lowerQuery = query.toLowerCase();
    return posts.filter(
        post =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.author.toLowerCase().includes(lowerQuery) ||
            post.category.toLowerCase().includes(lowerQuery)
    );
}

// Filter by category
export function filterByCategory(posts: Post[], category: string): Post[] {
    if (category === 'all') return posts;
    return posts.filter(post => post.category === category);
}

export interface Video {
    id: string;
    title: string;
    videoUrl: string;
    thumbnail: string;
    duration: string;
    views: string;
    category: string;
    publishedDate: string;
    isLive?: boolean;
}

// Fetch all videos
export async function fetchVideos(): Promise<Video[]> {
    try {
        const response = await axios.get<{ videos: Video[] }>(`${API_BASE_URL}/api/videos`);
        const videos = response.data.videos;

        // Cache videos
        await AsyncStorage.setItem('cached_videos', JSON.stringify(videos));

        return videos;
    } catch (error) {
        console.error('Failed to fetch videos:', error);

        // Try to load from cache
        const cached = await AsyncStorage.getItem('cached_videos');
        if (cached) {
            return JSON.parse(cached);
        }

        return [];
    }
}
