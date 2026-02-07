// Serverless function to fetch live match data from FotMob
// FotMob has accurate live minutes and doesn't require API key

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=30'); // Cache for 30 seconds
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // FotMob's unofficial API - Premier League ID is 47
        const response = await fetch('https://www.fotmob.com/api/leagues?id=47', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!response.ok) {
            console.error('FotMob API failed:', response.status);
            res.status(200).json({ matches: [] });
            return;
        }

        const data = await response.json();
        
        // Get live matches
        const liveMatches = [];
        
        // Check matches array for live games
        if (data.matches && data.matches.allMatches) {
            data.matches.allMatches.forEach(match => {
                // Only include live matches
                if (match.status && match.status.started && !match.status.finished) {
                    liveMatches.push({
                        homeTeam: match.home?.name || '',
                        awayTeam: match.away?.name || '',
                        minute: match.status?.liveTime?.minute || 0,  // Actual match minute from FotMob
                        status: match.status?.liveTime?.short || match.status?.reason?.short || ''
                    });
                }
            });
        }

        res.status(200).json({ matches: liveMatches });

    } catch (error) {
        console.error('Error fetching from FotMob:', error);
        res.status(200).json({ matches: [] });
    }
}
