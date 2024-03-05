const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
      required: true
  },
    price: {
        type: Number,
        required: true
    },
    offer: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    image: {
       type:Array
      },
      isCategoryBlocked: {
        type: Boolean,
        default: false
      },
    is_blocked: {
        type: Boolean,
        default: false,
        required: true
    }  
     
});

module.exports = mongoose.model("Product", productSchema);
