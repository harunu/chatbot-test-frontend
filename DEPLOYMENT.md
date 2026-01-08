# Deployment Guide - Azure Static Web Apps

This guide explains how to deploy the chatbot frontend to Azure Static Web Apps.

## Prerequisites

1. Azure account with an active subscription
2. Your backend API URL (where your Flask backend is hosted)
3. GitHub repository with this code

## Step 1: Create .env File for Local Development

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5050
VITE_API_KEY=your-api-key-here
```

**Note**: Never commit the `.env` file to Git (it's already in `.gitignore`)

## Step 2: Create Azure Static Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web App"
4. Click "Create"
5. Fill in the details:
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `chatbot-frontend` (or your preferred name)
   - **Plan type**: Free (for testing) or Standard (for production)
   - **Region**: Choose closest to your users
   - **Deployment details**:
     - **Source**: GitHub
     - **Organization**: Your GitHub username
     - **Repository**: `chatbot-frontend` (or your repo name)
     - **Branch**: `main`
6. Click "Review + Create"
7. Click "Create"

**Important**: During creation, Azure will ask you to authorize GitHub access. Click "Authorize Azure Static Web Apps"

## Step 3: Configure GitHub Secrets

After Azure creates the Static Web App, you need to add secrets to your GitHub repository.

### Get the Azure deployment token:
1. In Azure Portal, go to your Static Web App
2. Click "Manage deployment token"
3. Copy the token

### Add secrets to GitHub:
1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add these secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | [Token from Azure] | Deployment token from Step 3 |
| `VITE_API_URL` | `https://your-backend-url.com` | Your backend API URL |
| `VITE_API_KEY` | `your-api-key` | Your backend API key |

**Example values**:
- `VITE_API_URL`: `https://chatbot-backend.azurewebsites.net`
- `VITE_API_KEY`: Get this from your backend configuration

## Step 4: Deploy

The deployment happens automatically when you push to the `main` branch.

### Automatic deployment:
```bash
git add .
git commit -m "Deploy frontend"
git push origin main
```

### Manual deployment:
1. Go to GitHub repository
2. Click "Actions" tab
3. Click "Deploy Frontend - Azure Static Web Apps"
4. Click "Run workflow"
5. Select branch `main`
6. Click "Run workflow"

## Step 5: Access Your App

1. Go to Azure Portal
2. Open your Static Web App
3. You'll see the URL (e.g., `https://happy-flower-123abc.azurestaticapps.net`)
4. Click the URL to open your deployed app

## Troubleshooting

### Build fails in GitHub Actions
- Check "Actions" tab in GitHub
- Review the error logs
- Common issues:
  - Missing secrets (add them in GitHub Settings)
  - npm install fails (check package.json)

### App loads but can't connect to backend
- Check `VITE_API_URL` secret in GitHub
- Verify your backend is running and accessible
- Check CORS settings in your backend

### Environment variables not working
- Make sure secrets are named exactly as shown (case-sensitive)
- Re-run the deployment workflow after adding secrets

## What Happens During Deployment

1. GitHub Actions workflow triggers on push to `main`
2. Workflow checks out your code
3. Installs npm dependencies
4. Creates `.env` file from GitHub secrets
5. Builds the React app (`npm run build`)
6. Deploys the `dist` folder to Azure Static Web Apps
7. Azure serves your app on the provided URL

## Files You Need

- `.env.example` - Template for environment variables
- `.github/workflows/deploy-static-webapp.yml` - GitHub Actions workflow
- All files are already configured - just add the secrets!

## Summary

**What you need to do**:
1. Create Azure Static Web App (one time)
2. Add 3 secrets to GitHub (one time):
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `VITE_API_URL`
   - `VITE_API_KEY`
3. Push to `main` branch (every time you update)

**What happens automatically**:
- GitHub Actions builds and deploys your app
- Azure serves your app on a public URL
- Updates happen automatically on every push

That's it! No GitHub tokens, no complicated configurations needed.
