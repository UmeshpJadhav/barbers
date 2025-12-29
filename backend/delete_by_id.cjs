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

async function deleteByIds() {
    try {
        await mongoose.connect(MONGODB_URI);
        const idsToDelete = [
            '69523b1f5a726e9c4890255f', // Umesh
            '69522d922685d4efded62dbf'  // Suraj
        ];

        console.log(`Deleting ${idsToDelete.length} specific records...`);
        const res = await Queue.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`Deleted count: ${res.deletedCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

deleteByIds();
