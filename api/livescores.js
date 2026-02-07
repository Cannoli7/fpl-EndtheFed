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
        // Get today's date in YYYYMMDD format
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        
        // FotMob's matches endpoint - gets all matches for today
        const response = await fetch(`https://www.fotmob.com/api/matches?date=${dateStr}`, {
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
        
        // Get live Premier League matches
        const liveMatches = [];
        
        // FotMob returns leagues array, find Premier League (ccode: ENG, id: 47)
        if (data.leagues) {
            const premierLeague = data.leagues.find(league => 
                league.ccode === 'ENG' && league.name?.includes('Premier League')
            );
            
            if (premierLeague && premierLeague.matches) {
                premierLeague.matches.forEach(match => {
                    // Only include live matches
                    if (match.status && match.status.started && !match.status.finished) {
                        liveMatches.push({
                            homeTeam: match.home?.name || '',
                            awayTeam: match.away?.name || '',
                            minute: match.status?.liveTime?.minute || 0,
                            status: match.status?.liveTime?.short || match.status?.reason?.short || ''
                        });
                    }
                });
            }
        }

        res.status(200).json({ matches: liveMatches });

    } catch (error) {
        console.error('Error fetching from FotMob:', error);
        res.status(200).json({ matches: [] });
    }
}
