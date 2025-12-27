# Vercel Deployment Guide

This guide will help you deploy the AutoBalancer Pro frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your backend API deployed and accessible (or use the local backend URL for testing)

## Deployment Steps

### 1. Push Your Code to Git

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the Vite configuration

### 3. Configure Build Settings

Vercel should automatically detect the following from `vercel.json`:
- **Framework Preset**: Vite
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If you need to override these manually:
- Framework Preset: `Vite`
- Root Directory: `./` (or leave empty)
- Build Command: `npm run build:frontend`
- Output Directory: `dist`
- Install Command: `npm install`

### 4. Set Environment Variables

In the Vercel project settings, add the following environment variables:

#### Required:
- `VITE_API_BASE_URL` - The URL of your backend API (e.g., `https://your-backend.vercel.app` or `https://api.yourdomain.com`)

#### Optional (if you want to make them configurable):
- `VITE_SEPOLIA_RPC_URL` - Sepolia RPC endpoint
- `VITE_CONTRACT_ADDRESS` - Contract address (currently hardcoded)
- `VITE_CHAIN_ID` - Chain ID (currently hardcoded to 11155111)

**Note**: All environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

### 5. Deploy

Click "Deploy" and wait for the build to complete. Vercel will provide you with a deployment URL.

## Post-Deployment

### Important Notes

1. **Backend API**: Make sure your backend API is deployed and accessible at the URL specified in `VITE_API_BASE_URL`. The frontend will not work without a functioning backend.

2. **CORS**: Ensure your backend API allows requests from your Vercel deployment URL. Update CORS settings in your backend if necessary.

3. **Environment Variables**: If you need to update environment variables after deployment, go to Project Settings → Environment Variables, update them, and redeploy.

### Updating Your Deployment

Every push to your main/master branch will trigger a new deployment. You can also manually trigger deployments from the Vercel dashboard.

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Verify that `npm run build:frontend` works locally
- Check the build logs in Vercel for specific errors

### Frontend Can't Connect to Backend

- Verify `VITE_API_BASE_URL` is set correctly in Vercel environment variables
- Check that your backend is deployed and accessible
- Verify CORS settings on your backend allow requests from your Vercel domain

### 404 Errors on Routes

- The `vercel.json` file includes rewrites to handle client-side routing
- All routes should serve `index.html` for the React Router to work

## Project Structure

The deployment uses:
- **Build Command**: `npm run build:frontend` (which runs `vite build`)
- **Output Directory**: `dist` (default Vite output)
- **Framework**: Vite (detected automatically)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
