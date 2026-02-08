# Premier League Team Name Mapping Reference

This document shows how team names appear in different systems and how they should be mapped for the FPL Draft tracker.

## How it Works

The code uses the `teamNameAliases` object to convert FPL's team names to match API-Football's names.

**FPL Name → API-Football Name**

## Known Mappings (Tested & Verified)

| FPL Name | FPL Short Name | API-Football Name | Status |
|----------|----------------|-------------------|--------|
| Liverpool | LIV | Liverpool | ✅ Works (exact match) |
| Man City | MCI | Manchester City | ✅ Fixed in v1.59 |
| Man Utd | MUN | Manchester United | ⚠️ Needs verification |

## Current Aliases in Code (v1.61)

```javascript
const teamNameAliases = {
    'Brighton & Hove Albion': 'Brighton',
    'Brighton and Hove Albion': 'Brighton',
    'Man City': 'Manchester City',        // FPL uses short, API uses full
    'Man Utd': 'Manchester United',       // FPL uses short, API uses full
    'Spurs': 'Tottenham',                 // FPL sometimes uses Spurs
    'Tottenham Hotspur': 'Tottenham',     // Both systems use Tottenham
    'Wolverhampton Wanderers': 'Wolves',
    'West Ham United': 'West Ham',
    'Newcastle United': 'Newcastle',
    'Nottingham Forest': "Nott'ham Forest",
    'Leicester City': 'Leicester'
};
```

## All 20 Premier League Teams (2024-25 Season)

### Likely No Alias Needed (Names match)
- Arsenal
- Aston Villa
- Bournemouth
- Brentford
- Chelsea
- Crystal Palace
- Everton
- Fulham
- Ipswich Town
- Liverpool
- Southampton

### Need Aliases (FPL uses short names)
- **Man City** → Manchester City
- **Man Utd** → Manchester United
- **Spurs** → Tottenham
- **Brighton** → Brighton and Hove Albion (or Brighton & Hove Albion)
- **Leicester** → Leicester City
- **Newcastle** → Newcastle United
- **Nott'ham Forest** → Nottingham Forest
- **West Ham** → West Ham United
- **Wolves** → Wolverhampton Wanderers

## How to Test a New Mapping

1. **Start a match with the team playing live**
2. **Open browser console (F12)**
3. **Look for these logs:**
   ```
   Looking for team: "Man City" → normalized: "Manchester City" (ID: 13)
   Checking: Liverpool vs Manchester City
   ✓ MATCH: Status 1H, Minute 10
   ```
4. **If you see `✗ NOT FOUND`:**
   - Note the FPL name in quotes
   - Note the API-Football team name in "Checking:"
   - Add an alias mapping FPL name → API-Football name

## How to Update Mappings

### Option 1: Test During Live Matches
Watch the console logs during live matches to see which teams fail to match, then add the appropriate alias.

### Option 2: Manual API Calls (Requires API Key)
```bash
# Get all Premier League teams from API-Football
curl -X GET "https://v3.football.api-sports.io/teams?league=39&season=2024" \
  -H "x-apisports-key: YOUR_KEY"

# Get all teams from FPL
curl "https://draft.premierleague.com/api/bootstrap-static"
```

Compare the team names from both responses and create mappings.

## Fallback Matching

The code has a fallback that matches on the first word:
```javascript
// If exact match fails, try first word
const normFirstWord = normalizedName.split(' ')[0].toLowerCase();
const homeFirstWord = apiHome.split(' ')[0].toLowerCase();

if (normFirstWord === homeFirstWord || normFirstWord === awayFirstWord) {
    // MATCH
}
```

This helps catch cases like:
- "Brighton" matches "Brighton and Hove Albion"
- "Manchester" matches "Manchester City" or "Manchester United"

## Testing Checklist

When a new gameweek starts with live matches:
- [ ] Check console for "✗ NOT FOUND" messages
- [ ] Note which team failed to match
- [ ] Add alias to code
- [ ] Verify match shows "LIVE X'" indicator
- [ ] Update this document

## Version History

- **v1.59** - Fixed Man City mapping (was backwards)
- **v1.61** - Fixed timing - API call now happens after fixtures load
- **Current** - All tested aliases documented here

---

**Last Updated:** February 8, 2026  
**Maintained By:** Claude (via user feedback)
