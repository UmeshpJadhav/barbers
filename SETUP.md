# 🚀 Quick Setup Guide

## Step 1: Install MongoDB

### Windows:
Download and install MongoDB from: https://www.mongodb.com/try/download/community

Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Start MongoDB:
```bash
# If installed locally, start MongoDB service
# Or use MongoDB Atlas connection string
```

## Step 2: Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/barbershop
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Start backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

## Step 3: Setup Frontend

```bash
cd frontend
npm install
```

(Optional) Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Step 4: Access the Application

- **Customer View**: http://localhost:3000
- **Barber Login**: http://localhost:3000/login
  - First time? Register a new account
  - Then login to access the dashboard

## 📱 Optional: Enable SMS Notifications

1. Sign up for Twilio: https://www.twilio.com/
2. Get your Account SID, Auth Token, and Phone Number
3. Add to `backend/.env`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

SMS will automatically be sent when:
- Customer joins the queue
- Customer's turn comes

## 🎯 Testing

1. **Setup Barber Account**:
   - Go to http://localhost:3000/login
   - Click "Register" and create an account
   - Login with your credentials

2. **Test Queue System**:
   - Open customer view in one browser: http://localhost:3000
   - Open barber dashboard in another browser (or incognito): http://localhost:3000/barber
   - Join queue from customer view
   - See it appear in barber dashboard
   - Mark as "serving" from barber dashboard
   - See real-time updates in customer view

## ✅ You're all set!

The system is now ready to use. No more phone interruptions for the barber! 🎉

