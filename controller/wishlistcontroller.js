const Wishlist = require("../models/wishlistmodels");
const Product = require('../models/productmodels');
const User=require('../models/usermodels')

module.exports = {
  wishlistGet: async (req, res) => {
    try {
        const user_id = req.session.user_id;
        // console.log(user_id);
        const wishlistData = await Wishlist.findOne({ user: user_id }).populate("product.productId");
        // console.log(wishlistData, "wishData");

        res.render("user/wishlist", { wishlistData });
    } catch (error) {
        console.log(error);
    }
  },
  wishlistAdd: async (req, res) => {
    try {
        const user_id = req.session.user_id;
        console.log(user_id,'wishlistuser'); 
        if (!user_id) {
            return res.json({ session: false, error: "You want to Login" });
        }

        const product_id = req.body.productId;
        
        const productData = await Product.findById(product_id);
        console.log(productData);
        
        if (productData.quantity === 0) {
            return res.json({ quantity: false, error: 'Product is out of stock' });
        }
        if (productData.quantity > 0) {
            const wishlistProduct = await Wishlist.findOne({ user: user_id, 'product.productId': product_id });
            
            if (wishlistProduct) {
                return res.status(200).json({ success: false, error: 'Product already in wishlist' });
            }

            const data = {
                productId: product_id,
                price: productData.price,
                quantity: productData.quantity
            };

            console.log(productData.quantity,'wishquant07');

            await Wishlist.findOneAndUpdate(
                { user: user_id },
                {
                    $set: { user: user_id },
                    $push: { product: data },
                },
                { upsert: true, new: true }
            );
    
            return res.json({ success: true, stock: true, product: data });
            
        }   // Add the product to the wishlist

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  removeWishlistPost:async(req,res)=>{
    // console.log('wishlistremove');
    try {
        const { productId } = req.body;
        console.log(productId,'rewish');
        // const user_id = req.session.user_id;
        const userId = req.session.user_id;
        console.log( userId,'wishuseraano');

        const updatedWishlist=await Wishlist.findOneAndUpdate(
            {user: userId},
            {$pull:{product:{productId:productId}}},
            
        );
        console.log(updatedWishlist,'wishundo');
        if(!updatedWishlist){
            return res.status(404).json({ success: false, message: 'Wishlist not found' });  
        }
        return res.json({ success: true, message: 'Wishlist item removed successfully', updatedWishlist });

    } catch (error) {
        console.error('Error removing item from Wishlist:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    
    }
  }
};
