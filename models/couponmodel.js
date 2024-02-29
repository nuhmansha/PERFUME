const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    couponCode: {
        type: String,
        required: true,
        unique: true,
    },      
    discountPercentage: {
        type: Number,
    },
    maxDiscountAmount: {
        type: Number,
    },
    activationDate: {
        type: Date,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    criteriaAmount: {
        type: Number,
        required: true,
    },
    usedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    // isBlocked: {
    //     type: Boolean,
    //     default: false,
    // },
});

module.exports = mongoose.model("Coupon", couponSchema);
