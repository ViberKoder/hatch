// This file will be used to inject API_URL at build time
// In Vercel, set API_URL environment variable
// The build process will replace this with the actual URL

window.API_URL = process.env.API_URL || 'https://your-api-server.com/api/stats';
