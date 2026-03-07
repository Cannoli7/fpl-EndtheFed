// Vercel Serverless Function to manage stats in GitHub
// Saves/loads stats JSON files to/from a GitHub repository

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO; // e.g., "your-username/fpl-tracker" (your existing repo)
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
  
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ 
      error: 'GITHUB_TOKEN not configured in environment variables' 
    });
  }
  
  if (!GITHUB_REPO) {
    return res.status(500).json({ 
      error: 'GITHUB_REPO not configured in environment variables. Set it to your-username/repo-name' 
    });
  }
  
  const { gameweek, action, data } = req.method === 'POST' ? req.body : req.query;
  
  if (!gameweek) {
    return res.status(400).json({ error: 'gameweek parameter required' });
  }
  
  const filePath = `stats/gw${gameweek}.json`;
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
  
  try {
    if (action === 'save' || req.method === 'POST') {
      // SAVE stats to GitHub
      if (!data) {
        return res.status(400).json({ error: 'data required for save operation' });
      }
      
      // First, try to get the file to get its SHA (needed for update)
      let sha = null;
      try {
        const getResponse = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'FPL-Tracker'
          }
        });
        
        if (getResponse.ok) {
          const existingFile = await getResponse.json();
          sha = existingFile.sha;
        }
      } catch (e) {
        // File doesn't exist yet, that's fine
      }
      
      // Create or update the file
      const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
      
      const payload = {
        message: `Update stats for GW${gameweek}`,
        content: content,
        branch: GITHUB_BRANCH
      };
      
      if (sha) {
        payload.sha = sha; // Include SHA for update
      }
      
      const saveResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'FPL-Tracker'
        },
        body: JSON.stringify(payload)
      });
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`GitHub API error: ${saveResponse.status} - ${errorText}`);
      }
      
      const result = await saveResponse.json();
      
      return res.status(200).json({ 
        success: true,
        message: `Stats saved to GitHub for GW${gameweek}`,
        url: result.content.html_url
      });
      
    } else {
      // LOAD stats from GitHub
      const getResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'FPL-Tracker'
        }
      });
      
      if (!getResponse.ok) {
        if (getResponse.status === 404) {
          return res.status(404).json({ 
            error: `No stats found for GW${gameweek}` 
          });
        }
        throw new Error(`GitHub API error: ${getResponse.status}`);
      }
      
      const fileData = await getResponse.json();
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      const stats = JSON.parse(content);
      
      return res.status(200).json({ 
        success: true,
        data: stats,
        lastUpdated: fileData.commit?.author?.date || null
      });
    }
    
  } catch (error) {
    console.error('GitHub stats error:', error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}
