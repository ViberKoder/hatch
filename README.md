# Hatch - Egg Hatching Bot & Mini App

Telegram bot for sending and hatching eggs with beautiful mini app for statistics.

## Repository Structure

```
hatch/
├── bot/              # Telegram bot code
│   ├── bot.py        # Main bot file
│   ├── requirements.txt
│   └── ...
├── index.html        # Mini app
├── styles.css
├── app.js
└── vercel.json
```

## Mini App

Beautiful mini app for viewing egg hatching statistics, deployed on Vercel.

**Live:** https://hatch-ruddy.vercel.app

### Deployment

Deployed automatically on Vercel when pushing to main branch.

Set environment variable `API_URL` to your bot's API endpoint.

## Bot

Telegram bot @tohatchbot for sending eggs via inline mode.

### Deployment on Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub repo
3. Select this repository
4. Set root directory to `bot/`
5. Add environment variable:
   - `BOT_TOKEN=8439367607:AAGcK4tBrXKkqm5DDG7Sp3YSKEQTX09XqXE`
6. Railway will automatically detect Python and run `bot.py`

### API Endpoint

After deployment, your bot will have a public API endpoint:
```
https://your-app.railway.app/api/stats?user_id={user_id}
```

Update `API_URL` in Vercel to point to this endpoint.

## Features

- ✅ Inline mode for sending eggs
- ✅ Only recipients can hatch eggs
- ✅ Statistics tracking
- ✅ Beautiful mini app with modern design
- ✅ Real-time stats updates

## Setup

### Bot Setup

1. Deploy bot on Railway (see above)
2. Get public API URL
3. Update `API_URL` in Vercel

### Mini App Setup

1. Already deployed on Vercel
2. Set `API_URL` environment variable
3. Done!

## Tech Stack

- **Bot**: Python, python-telegram-bot, aiohttp
- **Mini App**: HTML, CSS, JavaScript, Telegram WebApp API
- **Hosting**: Railway (bot), Vercel (mini app)
