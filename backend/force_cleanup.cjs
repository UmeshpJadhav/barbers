const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbershop';

const queueSchema = new mongoose.Schema({
    status: String,
    queueNumber: Number,
    customerName: String
});

const Queue = mongoose.model('Queue', queueSchema);

async function clearServing() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to:', mongoose.connection.name);

        const result = await Queue.deleteMany({ status: 'serving' });
        console.log(`Deleted ${result.deletedCount} stuck 'serving' records.`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

clearServing();
