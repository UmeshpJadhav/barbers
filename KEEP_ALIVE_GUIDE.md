# 🚀 How to Stop "Cold Starts" (Server Sleeping)

You are seeing delays because **Render's Free Tier** puts your server to sleep after 15 minutes of inactivity. When a new user comes, it takes 30-60 seconds to "wake up".

To fix this **permanently and for free**, follow these steps to keep your server "warm" 24/7.

## The Solution: UptimeRobot (Free)

We will set up a free tool to "ping" (visit) your website every 5 minutes. This tricks Render into thinking your server is always busy, so it never goes to sleep.

### Step 1: Get Your Backend URL
1.  Go to your Render Dashboard.
2.  Copy your **Backend URL** (e.g., `https://prashant-hair-saloon-api.onrender.com`).
3.  Your "Ping URL" will be: `https://<YOUR-BACKEND-URL>/api/queue/shop-status`
    *   *Example*: `https://prashant-hair-saloon-api.onrender.com/api/queue/shop-status`

### Step 2: Set up UptimeRobot
1.  Go to [uptimerobot.com](https://uptimerobot.com/) and click **"Register for FREE"**.
2.  Sign up and log in.
3.  Click **+ Add New Monitor** (Green button).
4.  **Monitor Type**: Select **HTTP(s)**.
5.  **Friendly Name**: Enter "Barber Server".
6.  **URL (or IP)**: Paste your **Ping URL** from Step 1 (`.../api/queue/shop-status`).
7.  **Monitoring Interval**: Set to **5 minutes** (Important!).
8.  Click **Create Monitor**.

### Step 3: Done!
*   UptimeRobot will now visit your backend every 5 minutes.
*   Render will see this traffic and **keep your server running**.
*   Your app will now load **instantly** for customers, even if no one visited for hours.

> **Note**: This consumes some of your free generic hours on Render, but usually fits within the monthly free limit if you only have one active service.
