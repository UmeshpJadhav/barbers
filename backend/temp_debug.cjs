const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbershop';

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to:', mongoose.connection.name);

        // Dump all active records
        const queues = await mongoose.connection.db.collection('queues').find({
            status: { $in: ['waiting', 'serving'] }
        }).toArray();

        console.log('--- ACTIVE RECORDS ---');
        console.log(JSON.stringify(queues, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
