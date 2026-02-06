// Serverless function to fetch live match data from football-data.org
// This provides CORS-free access to live match minutes

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Fetch from football-data.org API (free tier, no auth needed for basic data)
        // Get Premier League matches (competition code: PL)
        const response = await fetch('https://api.football-data.org/v4/competitions/PL/matches?status=LIVE,IN_PLAY', {
            headers: {
                'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '' // Optional, works without for basic requests
            }
        });

        if (!response.ok) {
            // Fallback: try alternative free API
            const altResponse = await fetch('https://api.sportmonks.com/v3/football/livescores/inplay?api_token=' + (process.env.SPORTMONKS_API_KEY || ''));
            
            if (!altResponse.ok) {
                // If both fail, return empty array (no live matches)
                res.status(200).json({ matches: [] });
                return;
            }
            
            const altData = await altResponse.json();
            // Transform sportmonks data to our format
            const matches = (altData.data || []).map(match => ({
                homeTeam: match.participants?.[0]?.name,
                awayTeam: match.participants?.[1]?.name,
                minute: match.state?.minute || 0,
                status: match.state?.state
            }));
            
            res.status(200).json({ matches });
            return;
        }

        const data = await response.json();
        
        // Transform to simple format with team names and minutes
        const matches = (data.matches || []).map(match => ({
            homeTeam: match.homeTeam?.name,
            awayTeam: match.awayTeam?.name,
            minute: match.minute || 0,
            status: match.status
        }));

        res.status(200).json({ matches });

    } catch (error) {
        console.error('Error fetching live scores:', error);
        // Return empty array on error rather than failing
        res.status(200).json({ matches: [] });
    }
}
