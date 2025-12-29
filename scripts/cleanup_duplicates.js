const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbershop';

const queueSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    queueNumber: {
        type: Number,
        required: true
    },
    service: mongoose.Schema.Types.Mixed,
    status: {
        type: String,
        enum: ['waiting', 'serving', 'completed', 'cancelled'],
        default: 'waiting'
    },
    estimatedWaitTime: {
        type: Number,
        default: 0
    },
    position: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Queue = mongoose.model('Queue', queueSchema);

async function cleanupDuplicates() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        console.log('Finding duplicates...');
        // Find all documents
        const allDocs = await Queue.find({ status: { $in: ['waiting', 'serving'] } }).sort({ createdAt: -1 });

        const seen = new Set();
        const duplicates = [];

        // Keep the NEWEST one (first in list due to sort), mark others for deletion
        for (const doc of allDocs) {
            if (seen.has(doc.queueNumber)) {
                duplicates.push(doc._id);
                console.log(`Found duplicate: Ticket #${doc.queueNumber} (${doc.customerName}) - MARKED FOR DELETION`);
            } else {
                seen.add(doc.queueNumber);
                // console.log(`Keep: Ticket #${doc.queueNumber} (${doc.customerName})`);
            }
        }

        if (duplicates.length > 0) {
            console.log(`Deleting ${duplicates.length} duplicate entries...`);
            await Queue.deleteMany({ _id: { $in: duplicates } });
            console.log('✅ Duplicates deleted successfully.');
        } else {
            console.log('✨ No duplicates found in active queue.');
        }

        // Force unique index creation to prevent future dupes
        // await Queue.collection.createIndex({ queueNumber: 1 }, { unique: true });
        // console.log('🔒 Reinforced unique index on queueNumber.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

cleanupDuplicates();
