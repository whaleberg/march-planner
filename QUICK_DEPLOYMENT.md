# Quick Deployment Guide

## For GitHub Pages with Google Maps

### 1. Get Your Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps JavaScript API"
3. Create an API key
4. Restrict it to your GitHub Pages domain: `https://yourusername.github.io/*`

### 2. Set Up GitHub Secrets
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add secret: `VITE_GOOGLE_MAPS_API_KEY` = your API key

### 3. Deploy
1. Push to main branch
2. GitHub Actions will automatically build and deploy
3. Your site will be at: `https://yourusername.github.io/your-repo-name/`

## For Local Development

### 1. Create `.env` file
```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. Run locally
```bash
npm run dev
```

## For Other Hosting Platforms

### Vercel
1. Add environment variable: `VITE_GOOGLE_MAPS_API_KEY`
2. Deploy with `npm run build`

### Netlify
1. Add environment variable: `VITE_GOOGLE_MAPS_API_KEY`
2. Build command: `npm run build`
3. Publish directory: `dist`

### Firebase Hosting
1. Add to `.env.production`: `VITE_GOOGLE_MAPS_API_KEY=your_key`
2. Deploy with `firebase deploy`

## Troubleshooting

### Map not loading?
- Check browser console for errors
- Verify API key is correct
- Ensure Maps JavaScript API is enabled
- Check domain restrictions on your API key

### Build failing?
- Check GitHub Actions logs
- Verify all environment variables are set
- Ensure all dependencies are installed

## Security Reminder
- Always restrict your API key to specific domains
- Monitor usage in Google Cloud Console
- Set up billing alerts 