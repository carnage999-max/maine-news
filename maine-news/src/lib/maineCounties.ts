export interface MaineCountyConfig {
    slug: string;
    name: string;
    aliases: string[];
    top: string;
    left: string;
}

export const MAINE_COUNTIES: MaineCountyConfig[] = [
    { slug: 'aroostook', name: 'Aroostook', aliases: ['Aroostook County', 'Aroostook'], top: '17%', left: '53%' },
    { slug: 'washington', name: 'Washington', aliases: ['Washington County', 'Washington'], top: '35%', left: '82%' },
    { slug: 'penobscot', name: 'Penobscot', aliases: ['Penobscot County', 'Penobscot', 'Bangor'], top: '44%', left: '49%' },
    { slug: 'hancock', name: 'Hancock', aliases: ['Hancock County', 'Hancock', 'Ellsworth', 'Bar Harbor'], top: '55%', left: '69%' },
    { slug: 'piscataquis', name: 'Piscataquis', aliases: ['Piscataquis County', 'Piscataquis'], top: '45%', left: '28%' },
    { slug: 'somerset', name: 'Somerset', aliases: ['Somerset County', 'Somerset', 'Skowhegan'], top: '58%', left: '16%' },
    { slug: 'franklin', name: 'Franklin', aliases: ['Franklin County', 'Franklin', 'Farmington'], top: '67%', left: '9%' },
    { slug: 'oxford', name: 'Oxford', aliases: ['Oxford County', 'Oxford', 'Rumford'], top: '80%', left: '8%' },
    { slug: 'androscoggin', name: 'Androscoggin', aliases: ['Androscoggin County', 'Androscoggin', 'Lewiston', 'Auburn'], top: '77%', left: '20%' },
    { slug: 'kennebec', name: 'Kennebec', aliases: ['Kennebec County', 'Kennebec', 'Augusta', 'Waterville'], top: '69%', left: '34%' },
    { slug: 'waldo', name: 'Waldo', aliases: ['Waldo County', 'Waldo', 'Belfast'], top: '68%', left: '54%' },
    { slug: 'knox', name: 'Knox', aliases: ['Knox County', 'Knox', 'Rockland', 'Camden'], top: '78%', left: '56%' },
    { slug: 'lincoln', name: 'Lincoln', aliases: ['Lincoln County', 'Lincoln', 'Boothbay Harbor'], top: '85%', left: '47%' },
    { slug: 'sagadahoc', name: 'Sagadahoc', aliases: ['Sagadahoc County', 'Sagadahoc', 'Bath'], top: '79%', left: '40%' },
    { slug: 'cumberland', name: 'Cumberland', aliases: ['Cumberland County', 'Cumberland', 'Portland', 'Westbrook', 'Falmouth', 'Scarborough'], top: '91%', left: '18%' },
    { slug: 'york', name: 'York', aliases: ['York County', 'York', 'Biddeford', 'Sanford', 'Saco', 'Kennebunk', 'Kittery'], top: '98%', left: '13%' },
];

export function getCountyBySlug(slug: string) {
    return MAINE_COUNTIES.find((county) => county.slug === slug);
}

export function matchesCounty(text: string, county: MaineCountyConfig) {
    const haystack = text.toLowerCase();
    return county.aliases.some((alias) => haystack.includes(alias.toLowerCase()));
}
