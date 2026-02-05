// Vercel Serverless Function to fetch FPL deadline data
// Place this file in: api/deadline.js

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300');
  
  try {
    // Fetch from FPL API
    const fplResponse = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    const data = await fplResponse.json();
    
    // Return just the events
    return res.status(200).json({ 
      events: data.events || []
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: error.message 
    });
  }
}
