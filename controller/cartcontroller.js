const Cart=require('../models/cartmodels')
const Product=require('../models/productmodels')
const addressmodels=require('../models/addressmodels')
const User=require('../models/usermodels')

module.exports={
    cartGet:async(req,res)=>{
        console.log('cart aano');
        try {
            const user_id = req.session.user_id;
            console.log(user_id,'user '); 
            const cartData =  await Cart.findOne({user:user_id}).populate("product.productId")
            console.log(cartData,'cart data');
            const subtotal = cartData?.product.reduce((acc,val)=> acc+val.totalPrice,0)
            console.log(subtotal,'subtoto');



            res.render('user/cart',{cart:cartData,subtotal})
        } catch (error) {
            console.log(error);
        }
    },
    addCart:async (req,res)=>{
        console.log("post");
        try {
            const user_id = req.session.user_id;
            console.log(user_id,'add to cart user'); 
            if(!user_id){
                return res.json({session:false, error:"You want to Login"})
            } 
            // console.log(req.session);
            const product_id = req.body.productId;
            console.log(product_id,'undallo');
    
            const productData = await Product.findById( product_id);
            console.log(productData,'undo')
            if(productData.quantity===0){
                return res.json({ quantity: false, error: 'Product is out of stock' });
            }
            if (productData.quantity > 0) {
                const cartProduct = await Cart.findOne({ user: user_id, 'product.productId': product_id });
                
                if (cartProduct) {
                    return res.status(200).json({ success: false, error: 'Product already in cart' });
                }
    
                const data = {
                    productId: product_id,
                    price: productData.price,
                    totalPrice: productData.price,
                };
    
                console.log(productData.quantity,'looooooooooooooooooooooooo');
    
                await Cart.findOneAndUpdate(
                    { user: user_id },
                    {
                        $set: { user: user_id, couponDiscount: 0 },
                        $push: { product: data },
                    },
                    { upsert: true, new: true }
                );
    
                return res.json({ success: true, stock: true });
            } 
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    updateCartPost: async (req, res) => {
        try {
            const product_id = req.body.productId;
            const user_id = req.session.user_id;
            const count = req.body.count;
            console.log(product_id,'pro');

            const product = await Product.findOne({_id:product_id})

            const cartD = await Cart.findOne({ user: user_id });

            const currentQuantity = cartD.product.find((p) => p.productId == product_id)?.quantity || 0;

        if ((count === -1 && currentQuantity <= 1) || (count === 1 && currentQuantity + count > product.quantity)) {
        return res.json({ success: false, message: count === -1 ? 'Quantity cannot be decreased further.' : 'Cannot add more than the quantity' });
        }
        const cartData = await Cart.findOneAndUpdate(
            { user: user_id, 'product.productId': product_id },
            {
                $inc: {
                    'product.$.quantity': count,
                    'product.$.totalPrice': count * cartD.product.find((p) => p.productId.equals(product_id)).price,
                },
            }
        );
        res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    removeCartitemPost:async(req,res)=>{
        try {
            const { productId } = req.body;
            const userId = req.session.user_id;
    
            const updatedCart = await Cart.findOneAndUpdate(
                { user: userId },
                { $pull: { product: { productId: productId } } },
                
            );
    
            if (!updatedCart) {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }
    
            return res.json({ success: true, message: 'Cart item removed successfully', cart: updatedCart });
        } catch (error) {
            console.error('Error removing item from cart:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

    },
    checkoutGet:async(req,res)=>{
        try {
            const userId = req.session.user_id;
            console.log(userId,'checkuse');
            const  addresses = await addressmodels.findOne({user:userId})
            console.log(addresses,'add');
            const cartData = await Cart.findOne({user:userId}).populate('product.productId').populate('user')
            console.log(cartData,'sooooi');
            if(cartData){
                console.log(cartData.couponDiscount,"wh")
                cartData.couponDiscount!=0 ? await cartData.populate('couponDiscount') : 0
                const discountpercentage = cartData.couponDiscount !=0 ? cartData.couponDiscount.discountPercentage : 0;
                const maxDiscount = cartData.couponDiscount !=0 ? cartData.couponDiscount.maxDiscountAmount : 0;
                const subtotal = cartData.product.reduce((acc,val)=> acc+val.totalPrice,0);
                const percentageDiscount = subtotal - (discountpercentage/100) *subtotal;
                const discountAmount =subtotal - percentageDiscount;
                const discount = subtotal - maxDiscount
                console.log(discount,subtotal,"discount","subtotal")
                if(discountAmount<=maxDiscount){
                    res.render('user/checkout',{addresses,discount:percentageDiscount,cartData,subtotal,disamo:discountAmount})
                }else{
                    res.render('user/checkout',{addresses,discount,cartData,subtotal,disamo:maxDiscount})
                }
                console.log(discountpercentage,percentageDiscount,"percentage");
            }
        } catch (error) { 
            console.log(error);
        }
    }        

    

}
