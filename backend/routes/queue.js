import express from 'express';
import Queue from '../models/Queue.js';
import { notifyCustomerTurn, notifyQueueJoined } from '../services/smsService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware to attach io to request - MUST be before routes
router.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
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

// Join the queue
router.post('/join', async (req, res) => {
  try {
    const { customerName, phoneNumber } = req.body;

    if (!customerName || !phoneNumber) {
      return res.status(400).json({
        error: 'Customer name and phone number are required'
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
    const activeCount = await Queue.getActiveQueueCount();

    // Estimate wait time (assuming 15 minutes per customer)
    const estimatedWaitTime = activeCount * 15;

    const queueEntry = new Queue({
      customerName,
      phoneNumber,
      queueNumber,
      estimatedWaitTime
    });

    await queueEntry.save();

    // Send SMS notification (optional)
    await notifyQueueJoined(
      customerName,
      phoneNumber,
      queueEntry.queueNumber,
      activeCount + 1,
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
      position: activeCount + 1,
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

    const servedToday = await Queue.countDocuments({
      status: 'completed',
      // Optional: Filter by today's date if schema supports it
      // joinedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
    });

    const waiting = activeQueue.filter(c => c.status === 'waiting').length;
    const avgWait = waiting > 0
      ? Math.round(activeQueue.filter(c => c.status === 'waiting').reduce((sum, c) => sum + c.estimatedWaitTime, 0) / waiting)
      : 0;

    // Create a sanitized list for public display
    const currentQueue = activeQueue.map(c => ({
      queueNumber: c.queueNumber,
      // Mask name: "John Doe" -> "John D."
      name: c.customerName.split(' ').map((n, i) => i === 0 ? n : n[0] + '.').join(' '),
      status: c.status,
      joinedAt: c.joinedAt
    }));

    res.json({
      waiting,
      avgWait,
      servedToday,
      active: activeQueue.length,
      currentQueue
    });
  } catch (error) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
});

// Get all active queue (for barber dashboard) - Protected
router.get('/active', authenticate, async (req, res) => {
  try {
    const activeQueue = await Queue.find({
      status: { $in: ['waiting', 'serving'] }
    }).sort({ queueNumber: 1 });

    res.json({
      queue: activeQueue.map((entry, index) => ({
        queueNumber: entry.queueNumber,
        customerName: entry.customerName,
        phoneNumber: entry.phoneNumber,
        position: index + 1,
        status: entry.status,
        estimatedWaitTime: entry.estimatedWaitTime,
        joinedAt: entry.joinedAt
      })),
      total: activeQueue.length
    });
  } catch (error) {
    console.error('Error getting active queue:', error);
    res.status(500).json({ error: 'Failed to get active queue' });
  }
});

// Mark customer as serving - Protected
router.patch('/serving/:queueNumber', authenticate, async (req, res) => {
  try {
    const { queueNumber } = req.params;

    const customer = await Queue.findOne({ queueNumber });

    if (!customer) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }

    customer.status = 'serving';
    await customer.save();

    // Send SMS notification to customer
    await notifyCustomerTurn(
      customer.customerName,
      customer.phoneNumber,
      customer.queueNumber
    );

    // Emit socket event
    req.io.emit('queueUpdated', {
      action: 'serving',
      queueNumber: customer.queueNumber,
      customerName: customer.customerName
    });

    res.json({
      message: 'Customer marked as serving',
      queueNumber: customer.queueNumber
    });
  } catch (error) {
    console.error('Error marking as serving:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Mark customer as completed - Protected
router.patch('/complete/:queueNumber', authenticate, async (req, res) => {
  try {
    const { queueNumber } = req.params;

    const customer = await Queue.findOne({ queueNumber });

    if (!customer) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }

    customer.status = 'completed';
    customer.servedAt = new Date();
    await customer.save();

    // Emit socket event
    req.io.emit('queueUpdated', {
      action: 'completed',
      queueNumber: customer.queueNumber,
      customerName: customer.customerName
    });

    // Update estimated wait times for remaining customers
    const waitingCustomers = await Queue.find({
      status: 'waiting'
    }).sort({ queueNumber: 1 });

    for (let i = 0; i < waitingCustomers.length; i++) {
      waitingCustomers[i].estimatedWaitTime = (i + 1) * 15;
      await waitingCustomers[i].save();
    }

    res.json({
      message: 'Customer marked as completed',
      queueNumber: customer.queueNumber
    });
  } catch (error) {
    console.error('Error completing service:', error);
    res.status(500).json({ error: 'Failed to complete service' });
  }
});

// Cancel queue entry
router.delete('/cancel/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const customer = await Queue.findOne({
      phoneNumber,
      status: { $in: ['waiting', 'serving'] }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }

    customer.status = 'cancelled';
    await customer.save();

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

