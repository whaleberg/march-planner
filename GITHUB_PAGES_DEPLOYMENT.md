# GitHub Pages Deployment Guide

This guide explains how to deploy the March Organizer application to GitHub Pages with Google Maps integration.

## Prerequisites

1. A GitHub account
2. A Google Cloud Platform account with Maps JavaScript API enabled
3. A Google Maps API key

## Step 1: Set Up Google Maps API Key

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

### 1.2 Create an API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 1.3 Restrict the API Key (Recommended)
1. Click on the created API key to edit it
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your GitHub Pages domain: `https://yourusername.github.io/*`
4. Under "API restrictions", select "Restrict key" and choose "Maps JavaScript API"
5. Click "Save"

## Step 2: Configure GitHub Repository

### 2.1 Set Up GitHub Pages
1. Go to your GitHub repository
2. Go to "Settings" > "Pages"
3. Under "Source", select "GitHub Actions"
4. This will use the workflow file we'll create next

### 2.2 Add GitHub Secrets
1. In your repository, go to "Settings" > "Secrets and variables" > "Actions"
2. Click "New repository secret"
3. Add the following secrets:
   - **Name**: `VITE_GOOGLE_MAPS_API_KEY`
   - **Value**: Your Google Maps API key from Step 1.2

## Step 3: Create GitHub Actions Workflow

Create a file at `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      env:
        VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Step 4: Update Repository Settings

### 4.1 Enable GitHub Actions
1. Go to "Settings" > "Actions" > "General"
2. Under "Workflow permissions", select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"
4. Click "Save"

### 4.2 Configure Pages Source
1. Go to "Settings" > "Pages"
2. Under "Source", select "Deploy from a branch"
3. Select "gh-pages" branch and "/ (root)" folder
4. Click "Save"

## Step 5: Deploy

1. Push your changes to the main branch
2. Go to "Actions" tab in your repository
3. You should see the deployment workflow running
4. Once complete, your site will be available at `https://yourusername.github.io/your-repo-name/`

## Step 6: Verify Deployment

1. Visit your GitHub Pages URL
2. Check that the map loads correctly
3. Verify that all features work as expected

## Troubleshooting

### Map Not Loading
- Check that your API key is correctly set in GitHub Secrets
- Verify that the Maps JavaScript API is enabled in Google Cloud Console
- Check the browser console for any error messages
- Ensure your API key restrictions allow your GitHub Pages domain

### Build Failures
- Check the GitHub Actions logs for specific error messages
- Verify that all dependencies are properly installed
- Ensure the workflow file is correctly formatted

### Environment Variables Not Working
- Make sure the secret name matches exactly: `VITE_GOOGLE_MAPS_API_KEY`
- Verify that the environment variable is being passed to the build step
- Check that the variable is being used correctly in the code

## Security Notes

1. **API Key Restrictions**: Always restrict your Google Maps API key to your specific domain
2. **Public Repository**: Be aware that your API key will be visible in the built JavaScript files
3. **Usage Monitoring**: Monitor your Google Cloud Console for API usage and costs
4. **Key Rotation**: Consider rotating your API key periodically

## Alternative: Using a Custom Domain

If you want to use a custom domain:

1. Go to "Settings" > "Pages"
2. Under "Custom domain", enter your domain
3. Update your Google Maps API key restrictions to include your custom domain
4. Configure your DNS settings as instructed by GitHub

## Cost Considerations

- Google Maps JavaScript API has a free tier with generous limits
- Monitor your usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges
- Consider implementing usage limits in your application

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Review the browser console for errors
3. Verify your Google Cloud Console settings
4. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
5. Review the [Google Maps JavaScript API documentation](https://developers.google.com/maps/documentation/javascript) 