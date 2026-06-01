export interface MaineCountyConfig {
    slug: string;
    name: string;
    aliases: string[];
}

export const MAINE_COUNTIES: MaineCountyConfig[] = [
    { slug: 'aroostook', name: 'Aroostook', aliases: ['Aroostook County', 'Aroostook'] },
    { slug: 'washington', name: 'Washington', aliases: ['Washington County', 'Washington'] },
    { slug: 'penobscot', name: 'Penobscot', aliases: ['Penobscot County', 'Penobscot', 'Bangor'] },
    { slug: 'hancock', name: 'Hancock', aliases: ['Hancock County', 'Hancock', 'Ellsworth', 'Bar Harbor'] },
    { slug: 'piscataquis', name: 'Piscataquis', aliases: ['Piscataquis County', 'Piscataquis'] },
    { slug: 'somerset', name: 'Somerset', aliases: ['Somerset County', 'Somerset', 'Skowhegan'] },
    { slug: 'franklin', name: 'Franklin', aliases: ['Franklin County', 'Franklin', 'Farmington'] },
    { slug: 'oxford', name: 'Oxford', aliases: ['Oxford County', 'Oxford', 'Rumford'] },
    { slug: 'androscoggin', name: 'Androscoggin', aliases: ['Androscoggin County', 'Androscoggin', 'Lewiston', 'Auburn'] },
    { slug: 'kennebec', name: 'Kennebec', aliases: ['Kennebec County', 'Kennebec', 'Augusta', 'Waterville'] },
    { slug: 'waldo', name: 'Waldo', aliases: ['Waldo County', 'Waldo', 'Belfast'] },
    { slug: 'knox', name: 'Knox', aliases: ['Knox County', 'Knox', 'Rockland', 'Camden'] },
    { slug: 'lincoln', name: 'Lincoln', aliases: ['Lincoln County', 'Lincoln', 'Boothbay Harbor'] },
    { slug: 'sagadahoc', name: 'Sagadahoc', aliases: ['Sagadahoc County', 'Sagadahoc', 'Bath'] },
    { slug: 'cumberland', name: 'Cumberland', aliases: ['Cumberland County', 'Cumberland', 'Portland', 'Westbrook', 'Falmouth', 'Scarborough'] },
    { slug: 'york', name: 'York', aliases: ['York County', 'York', 'Biddeford', 'Sanford', 'Saco', 'Kennebunk', 'Kittery'] },
];

export function getCountyBySlug(slug: string) {
    return MAINE_COUNTIES.find((county) => county.slug === slug);
}

export function getCountySlugFromName(name: string) {
    const normalizedName = name.trim().toLowerCase().replace(/\s+county$/, '');
    return MAINE_COUNTIES.find((county) => county.name.toLowerCase() === normalizedName)?.slug;
}

export function matchesCounty(text: string, county: MaineCountyConfig) {
    const haystack = text.toLowerCase();
    return county.aliases.some((alias) => haystack.includes(alias.toLowerCase()));
}
