// Vercel Serverless Function: expected points from the main FPL game.
// The Draft API leaves ep_this/ep_next empty, so we read them from the classic
// FPL bootstrap and return a compact map keyed by player `code` (the same code
// is used for a player in both the Draft and classic games).
//
// Response: { currentEvent, nextEvent, players: { [code]: [ep_this, ep_next] } }
// ep_this = projection for currentEvent, ep_next = projection for nextEvent.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // FPL updates projections a few times a day; cache at the edge for 15 minutes
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    if (!response.ok) {
      return res.status(502).json({ error: `FPL API returned ${response.status}` });
    }
    const data = await response.json();

    const events = data.events || [];
    const current = events.find(e => e.is_current);
    const next = events.find(e => e.is_next);

    const toNum = v => (v === null || v === undefined || v === '') ? null : parseFloat(v);
    const players = {};
    (data.elements || []).forEach(el => {
      players[el.code] = [toNum(el.ep_this), toNum(el.ep_next)];
    });

    return res.status(200).json({
      currentEvent: current ? current.id : null,
      nextEvent: next ? next.id : null,
      players
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
