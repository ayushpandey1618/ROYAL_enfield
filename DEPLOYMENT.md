# 🚀 Deployment Guide: Royal Enfield Vishwanath Enterprises

This application is fully production-ready and can be deployed for **100% FREE** on **Render**, **Railway**, or **Vercel** with zero configuration.

---

## Option 1: Deploy on Render.com (Recommended - 100% Free & Automatic)

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Royal Enfield Showroom - Vishwanath Enterprises"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/royal-enfield-webpage.git
   git push -u origin main
   ```
2. Go to [https://render.com](https://render.com) and sign in (with GitHub).
3. Click **"New +"** → Select **"Web Service"**.
4. Connect your GitHub repository.
5. Render will automatically detect the settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **"Create Web Service"**!
   Your website will go live instantly on a free HTTPS URL (e.g. `https://royal-enfield-vishwanath-enterprises.onrender.com`).

---

## Option 2: Deploy on Railway.app

1. Go to [https://railway.app](https://railway.app)
2. Click **"Start a New Project"** → **"Deploy from GitHub repo"**.
3. Select your repository.
4. Railway will automatically build and deploy `server.js` using the included `Procfile`.
5. Under service settings, click **"Generate Domain"** to get your public live URL!

---

## Option 3: Deploy on Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm i -g vercel
   vercel
   ```
   Or import the GitHub repo on [https://vercel.com](https://vercel.com).
2. The included `vercel.json` will automatically configure routing.

---

## Running Locally / Production Server

```bash
npm install
npm start
```
- Webpage: `http://localhost:3000`
- Admin Portal: `http://localhost:3000/admin`
  - Default Admin Username: `admin`
  - Default Admin Password: `royalenfield1901`
