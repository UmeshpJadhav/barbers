# Deployment Guide for Barbershop App (MERN Stack)

This guide walks you through hosting your application for free using industry-standard platforms.

## Architecture Overview
-   **Database**: MongoDB Atlas (Cloud Database)
-   **Backend API**: Render (Node.js Hosting)
-   **Frontend**: Vercel (Next.js Optimization)

---

## Step 1: Push Code to GitHub
Ensure your project is pushed to a GitHub repository.
1.  Initialize git if you haven't: `git init`
2.  Create a `.gitignore` in root to exclude `node_modules` and `.env`.
3.  Commit and push to a new GitHub repo.

---

## Step 2: Database (MongoDB Atlas)
If you aren't already using a cloud database:
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **Free Cluster**.
3.  In "Network Access", allow access from anywhere (`0.0.0.0/0`) or specifically from Render IPs (Allow Anywhere is easiest for starters).
4.  Get your **Connection String** (looks like `mongodb+srv://<user>:<password>@cluster...`).

---

## Step 3: Backend Hosting (Render)
1.  Sign up at [Render.com](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    -   **Root Directory**: `backend` (Important! Your server is in this folder).
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server.js`
5.  **Environment Variables** (Copy from your local `.env`):
    -   `MONGO_URI`: Your MongoDB connection string.
    -   `JWT_SECRET`: Your secret key.
    -   `PORT`: `10000` (Render default).
    -   `FRONTEND_URL`: `https://your-vercel-app-name.vercel.app`
    -   `TWILIO_ACCOUNT_SID`: (Optional) For SMS.
    -   `TWILIO_AUTH_TOKEN`: (Optional) For SMS.
    -   `TWILIO_PHONE_NUMBER`: (Optional) For SMS (e.g., +1234567890).
6.  Click **Create Web Service**.
    -   *Note: Render free tier spins down after inactivity, so the first request might take 30-50s.*
7.  **Copy your Backend URL** (e.g., `https://barbers-api.onrender.com`).

---

## Step 4: Frontend Hosting (Vercel)
1.  Sign up at [Vercel.com](https://vercel.com/).
2.  Click **Add New** -> **Project**.
3.  Import your GitHub repository.
4.  **Settings**:
    -   **Framework Preset**: Next.js (Should auto-detect).
    -   **Root Directory**: Edit this! Select `frontend`.
5.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: Your Render Backend URL (e.g., `https://barbers-api.onrender.com/api`).
    -   `NEXT_PUBLIC_SOCKET_URL`: Your Render Backend URL (e.g., `https://barbers-api.onrender.com`).
6.  Click **Deploy**.

---

## Step 5: Final Connection
1.  Once Vercel gives you a domain (e.g., `barber-shop.vercel.app`).
2.  Go back to **Render Dashboard** -> Environment Variables.
3.  Update `FRONTEND_URL` (or `CORS_ORIGIN`) to your new Vercel domain to allow secure requests.
4.  Redeploy Render if needed (usually auto-restarts on var change).

## Troubleshooting
-   **CORS Errors**: Check your Backend `server.js` cors configuration. It needs to allow the Vercel domain.
-   **Socket Connection**: Ensure `NEXT_PUBLIC_SOCKET_URL` does NOT have `/api` at the end.
