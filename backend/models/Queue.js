import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  queueNumber: {
    type: Number,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'completed', 'cancelled'],
    default: 'waiting'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  servedAt: {
    type: Date
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Get next queue number
queueSchema.statics.getNextQueueNumber = async function() {
  const lastEntry = await this.findOne().sort({ queueNumber: -1 });
  return lastEntry ? lastEntry.queueNumber + 1 : 1;
};

// Get active queue count
queueSchema.statics.getActiveQueueCount = async function() {
  return await this.countDocuments({ status: { $in: ['waiting', 'serving'] } });
};

export default mongoose.model('Queue', queueSchema);

