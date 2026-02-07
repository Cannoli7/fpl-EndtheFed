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
        // Fetch Premier League fixtures (ID: 47)
        const response = await fetch('https://www.fotmob.com/api/leagues?id=47&tab=fixtures&type=league&timeZone=America/New_York', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
        
        // FotMob returns fixtures grouped by round
        if (data.fixtures && data.fixtures.allFixtures) {
            data.fixtures.allFixtures.forEach(fixture => {
                // Only include live matches (started but not finished)
                if (fixture.status && fixture.status.started && !fixture.status.finished) {
                    // Parse minute from liveTime.short (e.g., "13'" -> 13)
                    let minute = 0;
                    if (fixture.status.liveTime && fixture.status.liveTime.short) {
                        const minuteStr = fixture.status.liveTime.short.replace("'", "");
                        minute = parseInt(minuteStr) || 0;
                    }
                    
                    liveMatches.push({
                        homeTeam: fixture.home?.name || '',
                        awayTeam: fixture.away?.name || '',
                        minute: minute,
                        status: fixture.status?.liveTime?.short || ''
                    });
                }
            });
        }

        console.log('Live matches found:', liveMatches);
        res.status(200).json({ matches: liveMatches });

    } catch (error) {
        console.error('Error fetching from FotMob:', error);
        res.status(200).json({ matches: [] });
    }
}
