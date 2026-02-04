# FPL Draft Matchups Viewer

A beautiful matchup viewer for Fantasy Premier League Draft leagues with live stats, team jerseys, and bonus points.

## 🚀 Quick Deploy to Vercel (5 Minutes)

### Step 1: Create GitHub Account (if you don't have one)
1. Go to https://github.com
2. Sign up (it's free)

### Step 2: Upload Code to GitHub
1. Go to https://github.com/new
2. Name your repository: `fpl-matchups`
3. Make it **Public**
4. Click "Create repository"
5. Click "uploading an existing file"
6. Drag ALL the files from this folder into GitHub
7. Click "Commit changes"

### Step 3: Deploy to Vercel
1. Go to https://vercel.com/signup
2. Sign up with GitHub (free, no credit card needed)
3. Click "Add New Project"
4. Select your `fpl-matchups` repository
5. Click "Deploy"
6. Wait ~30 seconds
7. Done! You'll get a URL like: `fpl-matchups.vercel.app`

### Step 4: Share with Friends
Send them the URL! They just visit it in their browser.

---

## 🔧 Customization

### Change League ID
1. Open `public/index.html`
2. Find line 75: `const LEAGUE_ID = 8308;`
3. Change `8308` to your league ID
4. Save and push to GitHub
5. Vercel auto-updates in 30 seconds!

### Change Default Gameweek
1. Same file, find: `const CURRENT_GW = 24;`
2. Change `24` to whatever gameweek you want
3. Save and push to GitHub

---

## 📁 File Structure

```
fpl-matchups/
├── api/
│   └── fpl/
│       └── [...path].js    # API proxy (handles FPL requests)
├── public/
│   └── index.html          # The main app (all code in one file)
├── vercel.json             # Vercel configuration
├── package.json            # Project metadata
└── README.md               # This file
```

---

## 🎨 Features

- ⚽ Live match scores
- 👕 Team jerseys for each player
- 📊 Player stats (goals, assists, clean sheets, cards)
- 🥇🥈🥉 Bonus point medals
- 🔄 Navigate between gameweeks
- 📱 Mobile responsive
- 🌙 Dark theme

---

## 🔄 Making Updates

### Option 1: GitHub Web Interface (Easiest)
1. Go to your repository on GitHub
2. Click on the file you want to edit
3. Click the pencil icon (Edit)
4. Make your changes
5. Click "Commit changes"
6. Vercel auto-deploys in ~30 seconds!

### Option 2: GitHub Desktop (Better for multiple changes)
1. Download GitHub Desktop: https://desktop.github.com
2. Clone your repository
3. Edit files locally
4. Commit and push changes
5. Vercel auto-deploys!

---

## 🆘 Troubleshooting

**Problem: Page shows "Loading..." forever**
- Check browser console (F12) for errors
- Make sure your league ID is correct
- Try a different gameweek

**Problem: API errors**
- The FPL API might be down (happens during match days sometimes)
- Wait a few minutes and refresh

**Problem: Vercel deployment failed**
- Check you uploaded ALL files
- Make sure the folder structure matches above

---

## 💡 Ideas for Future Updates

- Add head-to-head history
- Show league standings
- Add player images
- Export to PDF
- Weekly email summaries

---

## 📝 License

MIT - Do whatever you want with it!

---

## 🙏 Credits

Built with love for FPL Draft league managers.
Data from the official Fantasy Premier League API.
