const Order = require("../models/odermodels");
const Address = require("../models/addressmodels");
const Product = require("../models/productmodels");
const Cart = require("../models/cartmodels");
const User = require("../models/usermodels");
const Review=require('../models/reviewmodels')
const crypto = require("crypto");
const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.RAZARPAY_KEY_ID,
  key_secret: process.env.RAZARPAY_KEY_SECRET,
});

module.exports = {
  placeorder: async (req, res) => {
    try {
      console.log(req.body, "all body");
      const userId = req.session.user_id;
      const addressIndex = !req.body.address ? 0 : req.body.address;
      const paymentMethod = req.body.payment;
      console.log(req.body, "is it getting");
      const status = paymentMethod == "onlinePayment" ? "pending" : "placed";

      if (!req.body.address) {
        const data = {
          fullName: req.body.fullName,
          country: req.body.country,
          housename: req.body.housename,
          state: req.body.state,
          city: req.body.city,
          pincode: req.body.pincode,
          phone: req.body.phone,
          email: req.body.email,
        };
        await Address.findOneAndUpdate(
          { user: userId },
          {
            $set: { user: userId },
            $push: { address: data },
          },
          { upsert: true, new: true }
        );
      }
      const addressData = await Address.findOne({ user: userId });
      const address = addressData.address[addressIndex];
      console.log(address);
      const cartData = await Cart.findOne({ user: userId });
      // const userData = await User.findOne({_id:userId})
      console.log(cartData);

      const subtotal = req.body.subtotal;
      const totalAmount = req.body.totalamount;

      console.log(totalAmount);
      const orderItems = cartData.product.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
        price: product.price,
        totalPrice: product.quantity * product.price,
        productstatus: "placed",
      }));

      const data = new Order({
        userId: userId,
        deliveryDetails: address,
        products: orderItems,
        purchaseDate: new Date(),
        subtotal: subtotal,
        discountamount: subtotal - totalAmount,
        totalAmount: totalAmount,
        status: status,
        paymentMethod: paymentMethod,
      });

      const orderData = await data.save();
      const orderId = orderData._id;

      if (status == "placed") {
        for (const item of orderItems) {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { quantity: -item.quantity } }
          );
        }
        await Cart.deleteOne({ user: userId });
        res.json({ orderId, placed: true });
      } else if (paymentMethod == "onlinePayment") {
        const options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: "" + orderData._id,
        };
        console.log(options);
        instance.orders.create(options, function (err, order) {
          res.json({ orderId, order });
        });
      } else {
        res.json({ error: "Invalid payment method" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  verifypayment: async (req, res) => {
    try {
      const userId = req.session.user_id;
      const paymentData = req.body;
      console.log(paymentData, "kitoot");
      const cartData = await Cart.findOne({ user: userId });

      const hmac = crypto.createHmac("sha512", process.env.RAZARPAY_KEY_SECRET);
      hmac.update(
        paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id
      );
      const hmacValue = hmac.digest("hex");

      if (hmacValue == paymentData.razorpay_signature) {
        for (const productData of cartData.product) {
          const { productId, quantity } = productData;
          await Product.updateOne(
            { _id: productId },
            { $inc: { quantity: -quantity } }
          );
        }
      }

      const orders = await Order.findByIdAndUpdate(
        { _id: paymentData.order.receipt },
        {
          $set: {
            status: "placed",
            paymentId: paymentData.payment.razorpay_payment_id,
          },
        }
      );

      const orderId = orders._id;
      await Cart.deleteOne({ user: userId });
      res.json({ placed: true, orderId });
    } catch (error) {
      console.log(error.message);
    }
  },
  orderDetailsGet: async (req, res) => {
    try {
      const id = req.query.id;
      const orderData = await Order.findOne({ _id: id }).populate("products.productId");
      const review = await Review.find({userId:req.session.user_id})
      console.log(orderData,review);
      res.render("user/orderdetails", { order: orderData,review });
    } catch (error) {
      console.log(error);
    }
  },
  cancelproduct: async (req, res) => {
    try {
      const userId = req.body.user_id;
      const productId = req.body.productId;
      const orderData = await Order.findOneAndUpdate(
        { "products._id": productId },
        { $set: { "products.$.productstatus": "cancel" } }
      );
      for (const orderProduct of orderData.products) {
        const product = orderProduct.productId;
        const quantity = orderProduct.quantity;

        await Product.updateOne(
          { _id: product },
          { $inc: { quantity: quantity } }
        );
      }
      res.json({cancel:true});
    } catch (error) {
        console.log(error);
    }
  },
  returnproduct:async(req,res)=>{
    try {
      const userId = req.session.user_id
      const productId=req.body.productId;
      const orderData=await Order.findOneAndUpdate(
        {"products._id":productId},
        {$set:{"products.$.productstatus":"Return"}}
      );
      console.log(orderData,'oddata');
      for (const orderProduct of orderData.products) {
        const product=orderProduct.productId;
        const quantity=orderProduct.quantity

        await Product.updateOne(
          {_id:product},
          {$inc:{quantity:quantity}}
        )
        
      }
      res.json({ cancel: true })

    } catch (error) {
      console.log(error);
    }
  },
  adminOrdersView:async(req,res)=>{
    try {
        const order=await Order.find({}).sort({parchaseDate:-1})
        res.render('admin/order',{order})
    } catch (error) {
        console.log(error);
    }
  },
  showorderGet:async(req,res)=>{
    try {
        const id=req.query.id;
        const order=await Order.findOne({_id:id}).populate('products.productId')
        res.render('admin/showorder',{order})
    } catch (error) {
        console.log(error);
    }
  },
  updateProductStatus:async(req,res)=>{
    try {
        const productid=req.body.productId;
        const productstatus=req.body.newStatus;
        const updateOrder=await Order.findOneAndUpdate(
            {
                'products._id':productid
            },
            {
                $set:{
                    'products.$.productstatus':productstatus,
                     status:productstatus   
                }
            },
            {new:true}
        );
        res.json({success:true})
        console.log(updateOrder,"uporder",productstatus);
    } catch (error) {
        console.log(error);
    }
  },


};
