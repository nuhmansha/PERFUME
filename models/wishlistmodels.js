const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const WishlistItemSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "users",
    required: true,
  },
  product: [
    {
      productId: {
        // Corrected to productId
        type: ObjectId,
        ref: "Product",
        required: true,
      },
      price: {
        type: Number,
        default: 0,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
});

const WishlistItem = mongoose.model("WishlistItem", WishlistItemSchema);

module.exports = WishlistItem;
