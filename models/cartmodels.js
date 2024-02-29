const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:"users",
        require:true,
    },
    product : [{
        productId:{
            type:ObjectId,
            ref:"Product",
            required:true,
        },
        quantity:{
            type:Number,
            default:1
        },
        price:{
            type:Number,
            default:0
        },
        totalPrice:{
            type:Number,
            default:0
        }

    }],
    couponDiscount: {
        type: String,
        ref:'Coupon',
      },
})

module.exports = mongoose.model('cart',cartSchema)