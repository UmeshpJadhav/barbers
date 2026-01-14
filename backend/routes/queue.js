import express from 'express';
import Queue from '../models/Queue.js';
import ShopStatus from '../models/ShopStatus.js';
import { notifyCustomerTurn, notifyQueueJoined } from '../services/smsService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware to attach io to request - MUST be before routes
router.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

// Get Shop Status (Public)
router.get('/shop-status', async (req, res) => {
  try {
    const status = await ShopStatus.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get shop status' });
  }
});

// Toggle Shop Status (Protected)
router.post('/shop-status', authenticate, async (req, res) => {
  try {
    const { isOpen } = req.body;
    let status = await ShopStatus.findOne();
    if (!status) {
      status = new ShopStatus({ isOpen });
    } else {
      status.isOpen = isOpen;
    }
    await status.save();

    // Notify everyone
    req.io.emit('shopStatusUpdated', { isOpen });

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shop status' });
  }
});

// Protect barber-specific routes
const protectBarberRoutes = (req, res, next) => {
  // Allow customer routes (join, position) without auth
  if (req.path === '/join' || req.path.startsWith('/position/') || req.path === '/cancel/') {
    return next();
  }
  // Require auth for barber routes
  return authenticate(req, res, next);
};

// Service Prices
// Service Details (Price in INR, Time in Minutes)
const SERVICES = {
  'Haircut': { price: 120, time: 30 },
  'Beard setting': { price: 80, time: 20 },
  'Clean shave': { price: 60, time: 20 },
  'Face cleanup': { price: 250, time: 25 },
  'Facial': { price: 400, time: 45 },
  'Treatment facial': { price: 600, time: 60 },
  'Ladies haircut': { price: 250, time: 40 },
  'Hair smoothing (Shoulder)': { price: 3000, time: 120 },
  'Hair pumping men (Half)': { price: 800, time: 45 },
  'Hair pumping men (Full)': { price: 1500, time: 75 }
};

// Join the queue
router.post('/join', async (req, res) => {
  try {
    console.log('📝 Join Request Body:', req.body);
    // Support both 'service' (legacy) and 'services' (new)
    let { customerName, phoneNumber, services, service, isPriority } = req.body;

    // Normalize to array
    if (!services && service) {
      services = Array.isArray(service) ? service : [service];
    }

    if (!customerName || !phoneNumber || !services || services.length === 0) {
      return res.status(400).json({
        error: 'Customer name, phone number, and at least one service are required'
      });
    }

    // Check if shop is open
    const shopStatus = await ShopStatus.getStatus();
    if (!shopStatus.isOpen) {
      return res.status(400).json({
        error: 'The shop is currently closed. Please try again later.'
      });
    }

    // Check if customer is already in queue
    const existingCustomer = await Queue.findOne({
      phoneNumber,
      status: { $in: ['waiting', 'serving'] }
    });

    if (existingCustomer) {
      return res.status(400).json({
        error: 'You are already in the queue',
        queueNumber: existingCustomer.queueNumber,
        position: await Queue.countDocuments({
          queueNumber: { $lt: existingCustomer.queueNumber },
          status: { $in: ['waiting', 'serving'] }
        }) + 1
      });
    }

    const queueNumber = await Queue.getNextQueueNumber();

    // Calculate total price and own service time
    let totalPrice = 0;
    let myServiceTime = 0;

    services.forEach(s => {
      const details = SERVICES[s];
      if (details) {
        totalPrice += details.price;
        myServiceTime += details.time;
      }
    });

    // Add VIP Fee
    if (isPriority) {
      totalPrice += 100;
    }

    // Estimate wait time: Sum of estimatedWaitTime of all people ahead + active serving time?
    // Simplified: Sum of (avg time) * (people ahead). 
    // Better: We can store 'estimatedServiceTime' on each entry.
    // For now, let's stick to the previous simple logic but refine it:
    // Existing active count * average service time (e.g. 25 mins).
    // OR: Sum of 'estimatedServiceTime' of all waiting/serving customers.
    // Let's retrieve all active customers to sum their times.
    const activeCustomers = await Queue.find({ status: { $in: ['waiting', 'serving'] } });

    // Calculate wait time based on what others are getting done
    // If we don't have stored times for old entries, assume 20 mins.
    // For new entries, we can sum their service times.
    // Since we didn't store 'serviceTime' explicitly before, let's just use a heuristic or calculate it if possible.
    // Actually, let's just use the count * 20 for simplicity to avoid breaking changes, 
    // OR if we want to be smart:
    // estimatedWaitTime = sum(active_customers.services.time)

    // Let's do a robust calculation:
    let estimatedWaitTime = 0;
    activeCustomers.forEach(c => {
      // If c.service is array (new), sum it. If string (old), lookup.
      if (Array.isArray(c.service)) {
        c.service.forEach(s => estimatedWaitTime += (SERVICES[s]?.time || 20));
      } else {
        estimatedWaitTime += (SERVICES[c.service]?.time || 20); // Fallback for old/unknown
      }
    });

    // VIPs skip line logic for wait time estimation is complex.
    // For now, we will just use the standard calculation but strictly their position will be better.

    const queueEntry = new Queue({
      customerName,
      phoneNumber,
      service: services, // Save as array
      price: totalPrice,
      queueNumber,
      estimatedWaitTime,
      isPriority: !!isPriority
    });

    await queueEntry.save();

    // Send SMS notification
    await notifyQueueJoined(
      customerName,
      phoneNumber,
      queueEntry.queueNumber,
      activeCustomers.length + 1,
      estimatedWaitTime
    );

    // Emit socket event for real-time update
    req.io.emit('queueUpdated', {
      action: 'joined',
      queueNumber: queueEntry.queueNumber,
      customerName: queueEntry.customerName
    });

    res.status(201).json({
      message: 'Successfully joined the queue',
      queueNumber: queueEntry.queueNumber,
      position: activeCustomers.length + 1,
      estimatedWaitTime: queueEntry.estimatedWaitTime
    });
  } catch (error) {
    console.error('Error joining queue:', error);
    res.status(500).json({ error: 'Failed to join queue' });
  }
});

// Get queue position by phone number
router.get('/position/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const customer = await Queue.findOne({
      phoneNumber,
      status: { $in: ['waiting', 'serving'] }
    });

    if (!customer) {
      return res.status(404).json({
        error: 'You are not in the queue'
      });
    }

    const position = await Queue.countDocuments({
      queueNumber: { $lt: customer.queueNumber },
      status: { $in: ['waiting', 'serving'] }
    }) + 1;

    res.json({
      queueNumber: customer.queueNumber,
      position,
      status: customer.status,
      estimatedWaitTime: customer.estimatedWaitTime,
      customerName: customer.customerName
    });
  } catch (error) {
    console.error('Error getting position:', error);
    res.status(500).json({ error: 'Failed to get queue position' });
  }
});

// Get queue stats (Public)
router.get('/stats', async (req, res) => {
  try {
    const activeQueue = await Queue.find({
      status: { $in: ['waiting', 'serving'] }
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const servedToday = await Queue.countDocuments({
      status: 'completed',
      updatedAt: { $gte: startOfDay }
    });

    const waiting = activeQueue.filter(c => c.status === 'waiting').length;
    const avgWait = waiting > 0
      ? Math.round(activeQueue.filter(c => c.status === 'waiting').reduce((sum, c) => sum + c.estimatedWaitTime, 0) / waiting)
      : 0;

    // Create a sanitized list for public display, removing duplicates
    const uniqueQueueMap = new Map();
    activeQueue.forEach(c => {
      // If duplicate exists, keep the one created earlier (or later, depending on consistent sort)
      if (!uniqueQueueMap.has(c.queueNumber)) {
        uniqueQueueMap.set(c.queueNumber, c);
      }
    });

    const currentQueue = Array.from(uniqueQueueMap.values()).map(c => ({
      queueNumber: c.queueNumber,
      // Mask name: "John Doe" -> "John D."
      name: c.customerName.split(' ').map((n, i) => i === 0 ? n : n[0] + '.').join(' '),
      service: Array.isArray(c.service) ? c.service.join(', ') : (c.service || 'Haircut'),
      status: c.status,
      joinedAt: c.joinedAt
    })).sort((a, b) => a.queueNumber - b.queueNumber);

    const shopStatus = await ShopStatus.getStatus();

    res.json({
      waiting,
      avgWait,
      servedToday,
      active: activeQueue.length,
      currentQueue,
      isOpen: shopStatus.isOpen
    });
  } catch (error) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
});

// Get all active queue (for barber dashboard) - Protected
router.get('/active', authenticate, async (req, res) => {
  try {
    const { date } = req.query; // Expect YYYY-MM-DD or undefined

    let startOfDay, endOfDay;

    if (date) {
      startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

    // If viewing history (past date), just show completed/cancelled for that day
    // If viewing today, show waiting/serving + completed today
    const isToday = !date || new Date().toISOString().split('T')[0] === date;

    let query = {};
    if (isToday) {
      query = {
        $or: [
          { status: { $in: ['waiting', 'serving'] } },
          { status: { $in: ['completed', 'cancelled'] }, updatedAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
      };
    } else {
      query = {
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      };
    }

    // Sort: Priority customers first, then by Queue Number
    const activeQueue = await Queue.find(query).sort({ isPriority: -1, queueNumber: 1 });

    // Calculate stats
    const totalEarnings = activeQueue
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (c.price || PRICES[c.service] || 0), 0);

    const servedCount = activeQueue.filter(c => c.status === 'completed').length;

    res.json({
      queue: activeQueue.map((entry, index) => ({
        queueNumber: entry.queueNumber,
        customerName: entry.customerName,
        phoneNumber: entry.phoneNumber,
        position: index + 1,
        status: entry.status,
        status: entry.status,
        service: Array.isArray(entry.service) ? entry.service.join(', ') : (entry.service || 'Haircut'),
        price: entry.price || 0,
        estimatedWaitTime: entry.estimatedWaitTime,
        joinedAt: entry.joinedAt
      })),
      total: activeQueue.length,
      totalEarnings,
      servedCount
    });
  } catch (error) {
    console.error('Error getting active queue:', error);
    res.status(500).json({ error: 'Failed to get active queue' });
  }
});

// Mark customer as serving - Protected
// Mark customer as serving - Protected
router.patch('/serving/:queueNumber', authenticate, async (req, res) => {
  try {
    const { queueNumber } = req.params;

    // ATOMIC UPDATE: Find Waiting + Update to Serving in one go
    const customer = await Queue.findOneAndUpdate(
      { queueNumber, status: 'waiting' },
      {
        $set: {
          status: 'serving',
          servedAt: new Date()
        }
      },
      { new: true } // Return the updated document
    );

    if (!customer) {
      // Fallback: Check if they were ALREADY serving (active idempotency check)
      const alreadyServing = await Queue.findOne({ queueNumber, status: 'serving' });
      if (alreadyServing) {
        return res.json({ message: 'Customer already serving', queueNumber });
      }
      return res.status(404).json({ error: 'Waiting customer not found for this ticket (or already served)' });
    }

    // --- Success! The user is now serving. ---

    // Helper to format services
    const formatServices = (services) => {
      if (Array.isArray(services)) return services.join(', ');
      return services || 'Haircut';
    };

    // Calculate queue stats for SMS
    const totalWaiting = await Queue.countDocuments({ status: 'waiting' });
    const estWaitTime = (totalWaiting * 15) + ' mins';

    // Send SMS notification (non-blocking)
    try {
      const message = `Hello ${customer.customerName}, it's your turn now! Please come inside. Service: ${formatServices(customer.service)}. Est wait: ${estWaitTime}.`;
      console.log(`[SMS] To: ${customer.phoneNumber}, Msg: ${message}`);
      await sendSMS(customer.phoneNumber, message);
    } catch (smsError) {
      console.warn('Failed to send SMS:', smsError);
    }

    // Emit socket event
    req.io.emit('queueUpdated', {
      action: 'serving',
      queueNumber: customer.queueNumber,
      customerName: customer.customerName,
      status: 'serving'
    });

    res.json({
      message: 'Customer marked as serving',
      queueNumber: customer.queueNumber
    });
  } catch (error) {
    console.error('Error marking as serving:', error);
    res.status(500).json({ error: error.message || 'Failed to update status' });
  }
});

// Mark customer as completed - Protected
router.patch('/complete/:queueNumber', authenticate, async (req, res) => {
  try {
    const { queueNumber } = req.params;

    // ATOMIC UPDATE: Prioritize Serve -> Complete
    let customer = await Queue.findOneAndUpdate(
      { queueNumber, status: 'serving' },
      {
        $set: {
          status: 'completed',
          servedAt: new Date()
        }
      },
      { new: true }
    );

    // If no one is serving with this ID, check if we are completing a waiter directly (rare but possible)
    if (!customer) {
      customer = await Queue.findOneAndUpdate(
        { queueNumber, status: 'waiting' },
        {
          $set: {
            status: 'completed',
            servedAt: new Date()
          }
        },
        { new: true }
      );
    }

    if (!customer) {
      return res.status(404).json({ error: 'Active queue entry not found' });
    }

    // --- Success! User is completed ---

    // Emit socket event immediately
    req.io.emit('queueUpdated', {
      action: 'completed',
      queueNumber: customer.queueNumber,
      customerName: customer.customerName,
      status: 'completed'
    });

    // Send success response immediately (Don't let background tasks block UI)
    res.json({
      message: 'Customer marked as completed',
      queueNumber: customer.queueNumber
    });

    // Background Task: Update wait times for others
    // We don't await this, so it doesn't slow down the response
    (async () => {
      try {
        const waitingCustomers = await Queue.find({ status: 'waiting' }).sort({ queueNumber: 1 });
        const updates = waitingCustomers.map((c, i) => {
          c.estimatedWaitTime = (i + 1) * 15;
          return c.save();
        });
        await Promise.all(updates);
      } catch (bgError) {
        console.error('Background wait time update failed:', bgError);
        // Silent failure is acceptable here as it only affects estimates, not core workflow
      }
    })();

  } catch (error) {
    console.error('Error completing service:', error);
    res.status(500).json({ error: 'Failed to complete service' });
  }
});

// Cancel queue entry
router.delete('/cancel/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // ATOMIC UPDATE: Find active entry and mark cancelled
    const customer = await Queue.findOneAndUpdate(
      {
        phoneNumber,
        status: { $in: ['waiting', 'serving'] }
      },
      {
        $set: { status: 'cancelled' }
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }

    // Emit socket event
    req.io.emit('queueUpdated', {
      action: 'cancelled',
      queueNumber: customer.queueNumber,
      customerName: customer.customerName
    });

    res.json({
      message: 'Queue entry cancelled',
      queueNumber: customer.queueNumber
    });
  } catch (error) {
    console.error('Error cancelling queue:', error);
    res.status(500).json({ error: 'Failed to cancel queue entry' });
  }
});

export default router;

