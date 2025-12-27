# Environment Variable Guide: VITE_API_BASE_URL

## What is VITE_API_BASE_URL?

This environment variable tells your frontend where to find your backend API. It should be the **base URL** of your backend server (without the `/api` path - the code adds that automatically).

## What Value to Use?

The value depends on **where you deploy your backend**. Here are the common scenarios:

---

### Scenario 1: Backend Deployed on Vercel (Recommended)

If you deploy your backend as a separate Vercel project:

**Value:**
```
https://your-backend-project.vercel.app
```

**Example:**
```
https://autobalancer-backend.vercel.app
```

**Note:** You need to deploy the backend first, then use its Vercel deployment URL.

---

### Scenario 2: Backend Deployed on Railway

If your backend is on Railway:

**Value:**
```
https://your-app-name.up.railway.app
```

**Example:**
```
https://autobalancer-api.up.railway.app
```

---

### Scenario 3: Backend Deployed on Render

If your backend is on Render:

**Value:**
```
https://your-service-name.onrender.com
```

**Example:**
```
https://autobalancer-backend.onrender.com
```

---

### Scenario 4: Backend on Your Own Server/VPS

If you have your backend running on your own server:

**Value:**
```
https://api.yourdomain.com
```
or
```
http://your-server-ip:3001
```
(Use HTTP only for development, always use HTTPS in production)

---

### Scenario 5: Testing with Local Backend (Development Only)

**⚠️ This only works for local development, NOT for production deployment!**

For local development only, you can use:
```
http://localhost:3001
```

**Important:** This will NOT work for a deployed Vercel frontend because localhost refers to the user's computer, not your server.

---

## How to Set the Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** Your backend URL (one of the examples above)
   - **Environment:** Select `Production`, `Preview`, and `Development` (or just `Production` if you only want it for production)
5. Click **Save**
6. **Redeploy** your project for the changes to take effect

---

## Important Notes

### ✅ DO:
- Use **HTTPS** URLs for production (not HTTP)
- Include the **full URL** including `https://`
- **Do NOT** include `/api` at the end (the code adds it automatically)
- Make sure your backend URL is accessible and not behind a firewall
- Deploy your backend **first**, then use its URL

### ❌ DON'T:
- Don't use `localhost` for production deployments
- Don't include `/api` in the URL
- Don't forget to include `https://` protocol
- Don't use trailing slashes

---

## Backend CORS Configuration

After setting the environment variable, make sure your backend allows requests from your Vercel frontend domain.

In your backend `.env` file, set:

```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-git-main.vercel.app
```

This allows your Vercel deployment (both production and preview URLs) to make API requests.

---

## Examples Summary

| Backend Location | VITE_API_BASE_URL Value |
|-----------------|------------------------|
| Vercel | `https://autobalancer-api.vercel.app` |
| Railway | `https://autobalancer-api.up.railway.app` |
| Render | `https://autobalancer-api.onrender.com` |
| Custom Domain | `https://api.yourdomain.com` |
| Local Dev Only | `http://localhost:3001` |

---

## Verification

After setting the environment variable:

1. Deploy your frontend
2. Open your browser's developer console (F12)
3. Look for the log message: `🔧 API Configuration: { API_BASE_URL: '...', BASE_URL: '...' }`
4. Check that the URL matches what you set
5. Test an API call to verify it works

---

## Need Help?

If you're unsure where to deploy your backend:
- **Easiest:** Deploy backend to Vercel (separate project)
- **Simple:** Use Railway or Render (free tiers available)
- **Advanced:** Use your own server/VPS

Make sure your backend is deployed and accessible before setting this environment variable!
