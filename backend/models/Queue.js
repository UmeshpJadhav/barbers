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
  service: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one service is required'
    }
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  queueNumber: {
    type: Number,
    required: true
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
  },
  isPriority: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Get next queue number for TODAY
queueSchema.statics.getNextQueueNumber = async function () {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const lastEntryToday = await this.findOne({
    createdAt: { $gte: startOfDay }
  }).sort({ queueNumber: -1 });

  return lastEntryToday ? lastEntryToday.queueNumber + 1 : 1;
};

// Get active queue count
queueSchema.statics.getActiveQueueCount = async function () {
  return await this.countDocuments({ status: { $in: ['waiting', 'serving'] } });
};

export default mongoose.model('Queue', queueSchema);

