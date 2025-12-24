# ✂️ Barbershop Queue Management System

A modern queue management system for barbershops that eliminates the need for manual phone calls and helps customers track their position in real-time.

## 🎯 Problem Solved

- **No more phone interruptions**: Barber doesn't need to call each customer manually
- **Real-time updates**: Customers can see their position and estimated wait time
- **Better customer experience**: Customers know exactly when their turn will come
- **Efficient management**: Barber can manage the entire queue from a dashboard

## 🚀 Features

### For Customers:
- Join the queue with name and phone number
- View real-time queue position
- See estimated wait time
- Get automatic updates when their turn comes
- Cancel queue entry if needed

### For Barber:
- View all customers in queue
- Mark customers as "serving" when starting
- Mark customers as "completed" when done
- Real-time queue updates
- See customer details and contact information

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Real-time**: WebSocket for live updates

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or bun

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/barbershop
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

## 🎮 Usage

1. **For Customers**: 
   - Visit `http://localhost:3000`
   - Enter your name and phone number
   - Join the queue
   - Monitor your position in real-time

2. **For Barber**:
   - Visit `http://localhost:3000/login`
   - Register a new account (first time) or login
   - After login, you'll be redirected to the dashboard
   - View all customers in queue
   - Click "Start Serving" when you begin with a customer
   - Click "Complete" when done
   - Use "Logout" button to sign out

## 📱 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new barber account
- `POST /api/auth/login` - Login barber
- `GET /api/auth/me` - Get current user (Protected)

### Queue Management
- `POST /api/queue/join` - Join the queue (Public)
- `GET /api/queue/position/:phoneNumber` - Get queue position (Public)
- `GET /api/queue/active` - Get all active queue entries (Protected - Barber only)
- `PATCH /api/queue/serving/:queueNumber` - Mark as serving (Protected - Barber only)
- `PATCH /api/queue/complete/:queueNumber` - Mark as completed (Protected - Barber only)
- `DELETE /api/queue/cancel/:phoneNumber` - Cancel queue entry (Public)

## 🔔 Future Enhancements

- SMS notifications via Twilio (configuration ready)
- Push notifications for mobile
- Multiple barber support
- Service type selection
- Appointment scheduling
- Customer history

## 📝 License

MIT

