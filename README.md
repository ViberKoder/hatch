# Hatch Mini App

Beautiful mini app for viewing egg hatching statistics in Telegram bot @tohatchbot.

## Design

Inspired by [wallet.tg](https://wallet.tg/) and [ton.org](https://ton.org/en) with modern, clean interface.

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables

Set `API_URL` environment variable in Vercel to point to your API endpoint:
```
API_URL=https://your-api-server.com/api/stats
```

## Features

- Real-time statistics
- Beautiful animations
- Responsive design
- Telegram WebApp integration
- Dark theme matching Telegram

## API

The app expects an API endpoint that returns:
```json
{
  "hatched_by_me": 10,
  "my_eggs_hatched": 5
}
```
