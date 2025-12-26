import mongoose from 'mongoose';

const shopStatusSchema = new mongoose.Schema({
    isOpen: {
        type: Boolean,
        required: true,
        default: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Helper to get or create the singleton status
shopStatusSchema.statics.getStatus = async function () {
    let status = await this.findOne();
    if (!status) {
        status = await this.create({ isOpen: true });
    }
    return status;
};

export default mongoose.model('ShopStatus', shopStatusSchema);
