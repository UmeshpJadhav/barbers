const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbershop';

const queueSchema = new mongoose.Schema({
    phoneNumber: String,
    customerName: String,
    queueNumber: Number,
    service: mongoose.Schema.Types.Mixed,
    status: String,
    estimatedWaitTime: Number,
    createdAt: Date
});

const Queue = mongoose.model('Queue', queueSchema);

async function debugState() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- RAW DB DUMP ---');
        const docs = await Queue.find({ status: { $in: ['waiting', 'serving'] } }).sort({ queueNumber: 1 });

        if (docs.length === 0) {
            console.log('Queue is EMPTY.');
        } else {
            docs.forEach(d => {
                console.log(`[${d.status.toUpperCase()}] #${d.queueNumber} - ${d.customerName} (ID: ${d._id})`);
                console.log(JSON.stringify(d, null, 2));
                console.log('-------------------');
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugState();
