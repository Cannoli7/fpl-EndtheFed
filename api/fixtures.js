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
        // Simple: Just query API-Football for this round
        const round = `Regular Season - ${event}`;
        // Season 2025 = 2025-26 season (Aug 2025 - May 2026)
        const apiUrl = `https://v3.football.api-sports.io/fixtures?league=39&season=2025&round=${encodeURIComponent(round)}`;
        
        console.log(`Fetching fixtures for: ${round}`);
        console.log(`API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
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
        console.log(`API-Football returned ${data.response?.length || 0} fixtures for ${round}`);
        
        // Log first fixture raw data to see what we're getting
        if (data.response && data.response.length > 0) {
            console.log('First fixture RAW from API-Football:', JSON.stringify(data.response[0], null, 2));
        }
        
        // Transform to simple format
        const fixtures = (data.response || []).map(item => ({
            homeTeam: item.teams?.home?.name || '',
            awayTeam: item.teams?.away?.name || '',
            homeLogo: item.teams?.home?.logo || '',
            awayLogo: item.teams?.away?.logo || '',
            homeScore: item.goals?.home,
            awayScore: item.goals?.away,
            status: item.fixture?.status?.short || '',
            kickoffTime: item.fixture?.date || '',
            finished: item.fixture?.status?.short === 'FT',
            started: ['LIVE', 'HT', 'FT', '1H', '2H', 'ET', 'P', 'BT'].includes(item.fixture?.status?.short || '')
        }));
        
        res.status(200).json(fixtures);

    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return res.status(200).json([]);
    }
}
