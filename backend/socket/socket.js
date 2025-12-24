import Queue from '../models/Queue.js';

export function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Send current queue status when client connects
    socket.on('getQueueStatus', async () => {
      try {
        const activeQueue = await Queue.find({
          status: { $in: ['waiting', 'serving'] }
        }).sort({ queueNumber: 1 });

        socket.emit('queueStatus', {
          queue: activeQueue,
          total: activeQueue.length
        });
      } catch (error) {
        console.error('Error getting queue status:', error);
        socket.emit('error', { message: 'Failed to get queue status' });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  // Store io instance in app for use in routes
  return io;
}

