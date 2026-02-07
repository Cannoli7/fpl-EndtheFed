// Serverless function to fetch live match data from API-Football
// Free tier: 100 requests/day - Direct API (no RapidAPI needed)

// Server-side cache (persists for function instance lifetime)
let cachedData = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=30');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const now = Date.now();
        
        // Return cached data if still fresh
        if (cachedData && (now - cacheTime) < CACHE_DURATION) {
            console.log('Returning cached data');
            res.status(200).json(cachedData);
            return;
        }
        
        // Direct API-Football: Get live Premier League matches (league ID: 39)
        const response = await fetch('https://v3.football.api-sports.io/fixtures?league=39&live=all', {
            headers: {
                'x-apisports-key': process.env.API_FOOTBALL_KEY || ''
            }
        });

        if (!response.ok) {
            console.error('API-Football error:', response.status);
            res.status(200).json({ matches: [] });
            return;
        }

        const data = await response.json();
        
        // Transform to simple format
        const matches = (data.response || []).map(item => ({
            homeTeam: item.teams?.home?.name || '',
            awayTeam: item.teams?.away?.name || '',
            minute: item.fixture?.status?.elapsed || 0,
            status: item.fixture?.status?.short || ''
        }));

        const result = { matches };
        
        // Update cache
        cachedData = result;
        cacheTime = now;
        console.log(`API called - cached ${matches.length} matches`);
        
        res.status(200).json(result);

    } catch (error) {
        console.error('Error:', error);
        res.status(200).json({ matches: [] });
    }
}
