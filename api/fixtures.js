// Serverless function to fetch EPL fixtures from API-Football
// Uses same API as livescores.js

let cachedData = null;
let cacheTime = 0;
const CACHE_DURATION = 300000; // 5 minutes (fixtures don't change as often)

export default async function handler(req, res) {
    const { event } = req.query; // Gameweek number
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=300');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (!event) {
        return res.status(400).json({ error: 'Event (gameweek) parameter required' });
    }
    
    try {
        const now = Date.now();
        const cacheKey = `gw${event}`;
        
        // Return cached data if still fresh and same gameweek
        if (cachedData && cachedData.cacheKey === cacheKey && (now - cacheTime) < CACHE_DURATION) {
            console.log('Returning cached fixtures for GW', event);
            res.status(200).json(cachedData.fixtures);
            return;
        }
        
        // Fetch from API-Football
        // Premier League = league 39, season 2024 (2024-25 season)
        const round = `Regular Season - ${event}`;
        const response = await fetch(
            `https://v3.football.api-sports.io/fixtures?league=39&season=2024&round=${encodeURIComponent(round)}`,
            {
                headers: {
                    'x-apisports-key': process.env.API_FOOTBALL_KEY || ''
                }
            }
        );

        if (!response.ok) {
            console.error('API-Football error:', response.status);
            return res.status(200).json([]);
        }

        const data = await response.json();
        
        // Transform to simple format with all needed data
        const fixtures = (data.response || []).map(item => ({
            homeTeam: item.teams?.home?.name || '',
            awayTeam: item.teams?.away?.name || '',
            homeLogo: item.teams?.home?.logo || '',
            awayLogo: item.teams?.away?.logo || '',
            homeScore: item.goals?.home,
            awayScore: item.goals?.away,
            status: item.fixture?.status?.short || '', // FT, LIVE, NS, HT, etc.
            kickoffTime: item.fixture?.date || '',
            finished: item.fixture?.status?.short === 'FT',
            started: ['LIVE', 'HT', 'FT', '1H', '2H', 'ET', 'P', 'BT'].includes(item.fixture?.status?.short || '')
        }));
        
        // Update cache
        cachedData = {
            cacheKey,
            fixtures
        };
        cacheTime = now;
        console.log(`API-Football: Fetched ${fixtures.length} fixtures for GW ${event}`);
        
        res.status(200).json(fixtures);

    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return res.status(200).json([]);
    }
}
