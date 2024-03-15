const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = mongoose.Schema({
    productId: {
        type: ObjectId,
        ref: "Product",
        required: true
    },
    userId: {
        type: ObjectId,
        ref: "users",
        required: true
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});



module.exports = mongoose.model('Review', reviewSchema);
