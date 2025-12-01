# Vercel Deployment Guide

This guide will help you deploy your EMS (Employee Management System) application on Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. MongoDB Atlas account (or your MongoDB connection string)
3. Git repository (GitHub, GitLab, or Bitbucket)
4. Node.js installed locally (for testing)

## Quick Start (Recommended Approach)

### Option 1: Frontend on Vercel + Backend Separately (Recommended)

This is the **recommended approach** as it's simpler, more maintainable, and provides better performance for your Express backend.

#### Step 1: Deploy Frontend to Vercel

**Method A: Using Vercel Web Interface (Easiest)**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure the project:
   - **Root Directory**: `frontend` (click "Edit" and set to `frontend`)
   - **Framework Preset**: Create React App (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
4. Click "Deploy"

**Method B: Using Vercel CLI**

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Deploy:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add: `REACT_APP_API_BASE` = `https://your-backend-url.com/api`
     (You'll update this after deploying the backend)

#### Step 2: Deploy Backend Separately

Deploy your backend to one of these platforms:

**Option A: Railway** (Recommended for MongoDB)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Deploy from GitHub (select your backend folder)
4. Add environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
   - `CORS_ORIGIN` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `PORT` - Usually set automatically

**Option B: Render**
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Set:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables (same as Railway)

**Option C: Heroku**
1. Go to [heroku.com](https://heroku.com)
2. Create a new app
3. Deploy from GitHub
4. Add environment variables in Settings → Config Vars

### Option 2: Full Stack on Vercel (Advanced - Serverless Functions)

⚠️ **Note**: This approach is more complex and may have cold start issues. Option 1 is recommended.

If you want everything on Vercel using serverless functions:

1. **Install backend dependencies at root level** (for serverless functions):
   ```bash
   npm install --prefix backend
   ```

2. **Deploy from project root**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
   - `CORS_ORIGIN` - Your Vercel frontend URL
   - `REACT_APP_API_BASE` - `/api` (for same-domain API calls)

4. The `api/index.js` file will handle all `/api/*` routes as serverless functions.

**Limitations**:
- Cold starts may cause slower initial requests
- MongoDB connections need to be managed carefully in serverless environment
- May require additional configuration for optimal performance

## Environment Variables

### Frontend (Vercel)
- `REACT_APP_API_BASE` - Backend API URL (e.g., `https://your-backend.railway.app/api` or `/api` for serverless)

### Backend (Railway/Render/etc. or Vercel)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)
- `PORT` - Server port (usually auto-set by platform)

## MongoDB Setup

1. **MongoDB Atlas** (Recommended):
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string
   - Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs in development)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/ems?retryWrites=true&w=majority`

2. **Update your connection string** in environment variables

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] CORS configured properly
- [ ] Test authentication (signup/login)
- [ ] Test API endpoints

## Troubleshooting

### CORS Errors
- Make sure `CORS_ORIGIN` includes your frontend URL
- Check that the backend allows credentials

### API Connection Issues
- Verify `REACT_APP_API_BASE` is set correctly
- Check backend logs for errors
- Ensure backend is running and accessible

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

### Build Errors
- Check Node.js version compatibility
- Review build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

## Quick Deploy Commands

### Frontend Only (Vercel)
```bash
cd frontend
vercel
```

### Full Stack (Vercel)
```bash
# From project root
vercel
```

## Support

For issues:
1. Check Vercel deployment logs
2. Check backend server logs
3. Verify environment variables
4. Test API endpoints with Postman/curl

