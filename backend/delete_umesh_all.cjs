require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://umesh:umesh@cluster0.0k53k.mongodb.net/barbers?retryWrites=true&w=majority&appName=Cluster0";

const queueSchema = new mongoose.Schema({}, { strict: false });
const Queue = mongoose.model('Queue', queueSchema);

async function cleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB...');

        // Delete ALL entries where customerName contains "Umesh" (case insensitive)
        const result = await Queue.deleteMany({ customerName: { $regex: /Umesh/i } });
        console.log(`Deleted ${result.deletedCount} records matching "Umesh".`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

cleanup();
