// Vercel Serverless Function to fetch FPL deadline data
// This file should be placed in: api/deadline.js

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300'); // Cache for 5 minutes
  
  try {
    // Fetch from FPL API (server-side, no CORS issues)
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    
    if (!response.ok) {
      throw new Error(`FPL API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract just the events data (gameweeks with deadlines)
    const events = data.events || [];
    
    // Return the events data
    res.status(200).json({ 
      events,
      cached_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching FPL data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch FPL data',
      message: error.message 
    });
  }
}
