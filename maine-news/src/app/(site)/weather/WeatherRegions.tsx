'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
    CloudRain,
    Compass,
    Droplets,
    Eye,
    Gauge,
    MoonStar,
    Sun,
    Sunrise,
    Sunset,
    Thermometer,
    Umbrella,
    Wind,
} from 'lucide-react';
import type { RegionForecast } from '@/lib/weather';
import styles from './WeatherReport.module.css';

interface WeatherRegionsProps {
    regions: RegionForecast[];
}

function formatPrecip(probability?: number | null) {
    if (probability === null || probability === undefined) return 'N/A';
    return `${Math.round(probability)}%`;
}

function formatWind(speed?: string, direction?: string) {
    if (!speed) return 'N/A';
    return direction ? `${speed} ${direction}` : speed;
}

function formatTemp(temp?: number, unit?: string) {
    if (temp === null || temp === undefined) return 'N/A';
    return unit ? `${Math.round(temp)}${unit}` : `${Math.round(temp)}`;
}

function formatValue(value?: number, suffix = '', digits = 0) {
    if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
    return `${value.toFixed(digits)}${suffix}`;
}

function getCompassDirection(degrees?: number) {
    if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
}

function getAqiLabel(index?: number) {
    if (index === null || index === undefined || Number.isNaN(index)) return 'Unavailable';
    if (index <= 50) return 'Good';
    if (index <= 100) return 'Moderate';
    if (index <= 150) return 'Unhealthy for Sensitive Groups';
    if (index <= 200) return 'Unhealthy';
    if (index <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

function getWeatherIcon(icon?: string) {
    if (!icon) return null;
    return icon.split(',')[0]?.trim() || null;
}

export default function WeatherRegions({ regions }: WeatherRegionsProps) {
    const [activeRegionId, setActiveRegionId] = useState(regions[0]?.id);

    const activeRegion = useMemo(() => {
        return regions.find(region => region.id === activeRegionId) || regions[0];
    }, [activeRegionId, regions]);

    if (!activeRegion) {
        return null;
    }

    const currentForecast = activeRegion.today;
    const currentMetrics = activeRegion.metrics;
    const currentIcon = getWeatherIcon(currentForecast?.icon);

    return (
        <section>
            <div className={styles.tabRow} role="tablist" aria-label="Regional forecast tabs">
                {regions.map(region => (
                    <button
                        key={region.id}
                        type="button"
                        role="tab"
                        aria-selected={activeRegionId === region.id}
                        aria-controls={`region-${region.id}`}
                        id={`tab-${region.id}`}
                        className={`${styles.tabButton} ${activeRegionId === region.id ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveRegionId(region.id)}
                    >
                        {region.label}
                    </button>
                ))}
            </div>

            <div id={`region-${activeRegion.id}`} role="tabpanel" aria-labelledby={`tab-${activeRegion.id}`}>
                <div className={styles.regionHeader}>
                    <div>
                        <div className={styles.regionName}>{activeRegion.label}</div>
                        <div className={styles.regionLocation}>{activeRegion.location}</div>
                    </div>
                </div>

                {activeRegion.status === 'error' ? (
                    <div className={styles.errorState}>{activeRegion.errorMessage}</div>
                ) : (
                    <>
                        <div className={styles.dashboardGrid}>
                            <article className={styles.currentCard}>
                                <div className={styles.cardEyebrow}>Current Conditions</div>
                                <div className={styles.currentCardTop}>
                                    <div>
                                        <div className={styles.currentTemp}>
                                            {formatTemp(
                                                currentMetrics?.temperature ?? currentForecast?.temperature,
                                                currentMetrics?.temperatureUnit ?? currentForecast?.temperatureUnit
                                            )}
                                        </div>
                                        <div className={styles.currentSummary}>
                                            {currentForecast?.shortForecast || 'Forecast unavailable'}
                                        </div>
                                        <div className={styles.currentSubline}>
                                            Feels like {formatValue(currentMetrics?.feelsLike, 'F')} · Wind {formatValue(currentMetrics?.windSpeed, ' mph')}
                                        </div>
                                    </div>

                                    {currentIcon ? (
                                        <div className={styles.currentIconWrap}>
                                            <Image
                                                src={currentIcon}
                                                alt={currentForecast?.shortForecast || 'Weather icon'}
                                                width={88}
                                                height={88}
                                                className={styles.currentIcon}
                                                unoptimized
                                            />
                                        </div>
                                    ) : null}
                                </div>

                                <div className={styles.currentStats}>
                                    <div className={styles.statPill}>
                                        <Droplets size={15} />
                                        <span>Humidity {formatValue(currentMetrics?.humidity, '%')}</span>
                                    </div>
                                    <div className={styles.statPill}>
                                        <Umbrella size={15} />
                                        <span>Rain {formatValue(currentMetrics?.precipitationToday, '"', 2)}</span>
                                    </div>
                                    <div className={styles.statPill}>
                                        <Gauge size={15} />
                                        <span>Pressure {formatValue(currentMetrics?.pressure, ' hPa')}</span>
                                    </div>
                                    <div className={styles.statPill}>
                                        <Eye size={15} />
                                        <span>Visibility {formatValue(currentMetrics?.visibility, ' mi')}</span>
                                    </div>
                                </div>
                            </article>

                            <div className={styles.metricGrid}>
                                <article className={styles.metricCard}>
                                    <div className={styles.metricLabel}>
                                        <Wind size={16} />
                                        <span>Wind</span>
                                    </div>
                                    <div className={styles.metricValue}>{formatValue(currentMetrics?.windSpeed, ' mph')}</div>
                                    <div className={styles.metricSupporting}>
                                        Gusts {formatValue(currentMetrics?.windGust, ' mph')}
                                    </div>
                                    <div className={styles.metricFootnote}>
                                        Direction {getCompassDirection(currentMetrics?.windDirection)}
                                    </div>
                                </article>

                                <article className={styles.metricCard}>
                                    <div className={styles.metricLabel}>
                                        <Thermometer size={16} />
                                        <span>Feels Like</span>
                                    </div>
                                    <div className={styles.metricValue}>{formatValue(currentMetrics?.feelsLike, 'F')}</div>
                                    <div className={styles.metricSupporting}>
                                        Humidity {formatValue(currentMetrics?.humidity, '%')}
                                    </div>
                                    <div className={styles.metricFootnote}>
                                        Precip chance {formatPrecip(currentForecast?.precipitationChance)}
                                    </div>
                                </article>

                                <article className={styles.metricCard}>
                                    <div className={styles.metricLabel}>
                                        <Sun size={16} />
                                        <span>Air Quality</span>
                                    </div>
                                    <div className={styles.metricValue}>{formatValue(currentMetrics?.airQualityIndex)}</div>
                                    <div className={styles.metricSupporting}>
                                        {getAqiLabel(currentMetrics?.airQualityIndex)}
                                    </div>
                                    <div className={styles.metricFootnote}>
                                        UV index {formatValue(currentMetrics?.uvIndex)}
                                    </div>
                                </article>

                                <article className={styles.metricCard}>
                                    <div className={styles.metricLabel}>
                                        <Sunrise size={16} />
                                        <span>Sun & Sky</span>
                                    </div>
                                    <div className={styles.sunRow}>
                                        <div className={styles.sunItem}>
                                            <Sunrise size={14} />
                                            <span>{currentMetrics?.sunrise || 'N/A'}</span>
                                        </div>
                                        <div className={styles.sunItem}>
                                            <Sunset size={14} />
                                            <span>{currentMetrics?.sunset || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.metricFootnote}>
                                        Outlook: {currentForecast?.shortForecast || 'Unavailable'}
                                    </div>
                                </article>
                            </div>
                        </div>

                        {activeRegion.hourly.length > 0 && (
                            <section className={styles.hourlySection}>
                                <div className={styles.sectionTitleRow}>
                                    <h2 className={styles.sectionTitle}>Hourly Forecast</h2>
                                    <div className={styles.sectionHint}>Next 12 hours</div>
                                </div>
                                <div className={styles.hourlyScroller}>
                                    {activeRegion.hourly.map(hour => {
                                        const icon = getWeatherIcon(hour.icon);
                                        return (
                                            <article key={hour.startTime} className={styles.hourlyCard}>
                                                <div className={styles.hourlyTime}>{hour.displayTime}</div>
                                                {icon ? (
                                                    <Image
                                                        src={icon}
                                                        alt={hour.shortForecast}
                                                        width={42}
                                                        height={42}
                                                        className={styles.hourlyIcon}
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <CloudRain size={24} className={styles.fallbackHourlyIcon} />
                                                )}
                                                <div className={styles.hourlyTemp}>
                                                    {formatTemp(hour.temperature, hour.temperatureUnit)}
                                                </div>
                                                <div className={styles.hourlyForecast}>{hour.shortForecast}</div>
                                                <div className={styles.hourlyMeta}>
                                                    <span>{formatPrecip(hour.precipitationChance)} rain</span>
                                                    <span>{formatWind(hour.windSpeed, hour.windDirection)}</span>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <div className={styles.forecastGrid}>
                            {activeRegion.today && (
                                <article className={styles.forecastCard}>
                                    <div className={styles.forecastHeader}>
                                        <div className={styles.forecastLabelRow}>
                                            <Sun size={16} className={styles.forecastIcon} />
                                            <span>Today</span>
                                        </div>
                                        {getWeatherIcon(activeRegion.today.icon) ? (
                                            <Image
                                                src={getWeatherIcon(activeRegion.today.icon) as string}
                                                alt={activeRegion.today.shortForecast}
                                                width={44}
                                                height={44}
                                                className={styles.periodIcon}
                                                unoptimized
                                            />
                                        ) : null}
                                    </div>
                                    <div className={styles.forecastTemp}>
                                        {formatTemp(activeRegion.today.temperature, activeRegion.today.temperatureUnit)}
                                    </div>
                                    <div className={styles.forecastSummary}>{activeRegion.today.shortForecast}</div>
                                    <p className={styles.forecastNarrative}>{activeRegion.today.detailedForecast}</p>
                                    <div className={styles.forecastDetails}>
                                        <span className={styles.detailItem}>
                                            <Wind size={14} />
                                            {formatWind(activeRegion.today.windSpeed, activeRegion.today.windDirection)}
                                        </span>
                                        <span className={styles.detailItem}>
                                            <Droplets size={14} />
                                            {formatPrecip(activeRegion.today.precipitationChance)}
                                        </span>
                                    </div>
                                </article>
                            )}

                            {activeRegion.tonight && (
                                <article className={styles.forecastCard}>
                                    <div className={styles.forecastHeader}>
                                        <div className={styles.forecastLabelRow}>
                                            <MoonStar size={16} className={styles.forecastIcon} />
                                            <span>Tonight</span>
                                        </div>
                                        {getWeatherIcon(activeRegion.tonight.icon) ? (
                                            <Image
                                                src={getWeatherIcon(activeRegion.tonight.icon) as string}
                                                alt={activeRegion.tonight.shortForecast}
                                                width={44}
                                                height={44}
                                                className={styles.periodIcon}
                                                unoptimized
                                            />
                                        ) : null}
                                    </div>
                                    <div className={styles.forecastTemp}>
                                        {formatTemp(activeRegion.tonight.temperature, activeRegion.tonight.temperatureUnit)}
                                    </div>
                                    <div className={styles.forecastSummary}>{activeRegion.tonight.shortForecast}</div>
                                    <p className={styles.forecastNarrative}>{activeRegion.tonight.detailedForecast}</p>
                                    <div className={styles.forecastDetails}>
                                        <span className={styles.detailItem}>
                                            <Wind size={14} />
                                            {formatWind(activeRegion.tonight.windSpeed, activeRegion.tonight.windDirection)}
                                        </span>
                                        <span className={styles.detailItem}>
                                            <Droplets size={14} />
                                            {formatPrecip(activeRegion.tonight.precipitationChance)}
                                        </span>
                                    </div>
                                </article>
                            )}

                            {activeRegion.tomorrow && (
                                <article className={styles.forecastCard}>
                                    <div className={styles.forecastHeader}>
                                        <div className={styles.forecastLabelRow}>
                                            <Compass size={16} className={styles.forecastIcon} />
                                            <span>Tomorrow</span>
                                        </div>
                                        {getWeatherIcon(activeRegion.tomorrow.icon) ? (
                                            <Image
                                                src={getWeatherIcon(activeRegion.tomorrow.icon) as string}
                                                alt={activeRegion.tomorrow.shortForecast}
                                                width={44}
                                                height={44}
                                                className={styles.periodIcon}
                                                unoptimized
                                            />
                                        ) : null}
                                    </div>
                                    <div className={styles.forecastTemp}>
                                        {formatTemp(activeRegion.tomorrow.temperature, activeRegion.tomorrow.temperatureUnit)}
                                    </div>
                                    <div className={styles.forecastSummary}>{activeRegion.tomorrow.shortForecast}</div>
                                    <p className={styles.forecastNarrative}>{activeRegion.tomorrow.detailedForecast}</p>
                                    <div className={styles.forecastDetails}>
                                        <span className={styles.detailItem}>
                                            <Wind size={14} />
                                            {formatWind(activeRegion.tomorrow.windSpeed, activeRegion.tomorrow.windDirection)}
                                        </span>
                                        <span className={styles.detailItem}>
                                            <Droplets size={14} />
                                            {formatPrecip(activeRegion.tomorrow.precipitationChance)}
                                        </span>
                                    </div>
                                </article>
                            )}
                        </div>

                        {activeRegion.outlook.length > 0 && (
                            <section className={styles.outlook}>
                                <div className={styles.sectionTitleRow}>
                                    <h2 className={styles.sectionTitle}>7 Day Outlook</h2>
                                    <div className={styles.sectionHint}>Regional long-range forecast</div>
                                </div>
                                <div className={styles.outlookList}>
                                    {activeRegion.outlook.map((day, index) => {
                                        const icon = getWeatherIcon(day.icon);
                                        return (
                                            <article key={`${day.name}-${index}`} className={styles.outlookRow}>
                                                <div className={styles.outlookDay}>
                                                    <span>{day.name}</span>
                                                </div>
                                                <div className={styles.outlookCondition}>
                                                    {icon ? (
                                                        <Image
                                                            src={icon}
                                                            alt={day.shortForecast}
                                                            width={34}
                                                            height={34}
                                                            className={styles.outlookWeatherIcon}
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <Sun size={18} className={styles.forecastIcon} />
                                                    )}
                                                    <span>{day.shortForecast}</span>
                                                </div>
                                                <div className={styles.outlookReading}>
                                                    {formatTemp(day.temperature, day.temperatureUnit)}
                                                </div>
                                                <div className={styles.outlookReadingMuted}>
                                                    {formatPrecip(day.precipitationChance)} rain
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
