const Coupon = require("../models/couponmodel");
const Cart=require('../models/cartmodels')

module.exports = {
  couponGet: async (req, res) => {
    try {
      const CouponData = await Coupon.find({});
      res.render("admin/coupon", { coupon: CouponData });
    } catch (error) {
      console.log(error);
    }
  },
  addCouponGet:async(req,res)=>{
    try {
        res.render("admin/addcoupon")
    } catch (error) {
        console.log(error);
    }
  },
  addCouponPost:async(req,res)=>{
    try {
        const{name,couponCode,discountPercentage,maxDiscountAmount,activationDate,expiryDate,criteriaAmount}=req.body
        const existcoupon=await Coupon.findOne({couponCode:couponCode})

        if(existcoupon){
            return res.status(400).json({
                error: 'Coupon code already exists'
            });
        }
        const addCoupon=new Coupon({
            name,
            couponCode,
            discountPercentage,maxDiscountAmount,activationDate,expiryDate,criteriaAmount
        })
        await addCoupon.save()

        res.redirect("/admin/coupon")
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
  },
  editCouponGet:async(req,res)=>{
    try {
        const couponId = req.query.id;
        const coupon = await Coupon.findById(couponId)
        // console.log(couponId);
        res.render('admin/editcoupon',{coupon})
    } catch (error) {
        console.log(error);
    }
  },
  editCouponPost:async(req,res)=>{
    try {

        const couponId = req.body._id
    
        console.log(couponId);
        await Coupon.findByIdAndUpdate({_id:couponId},
            {
            name: req.body.name,
            couponCode: req.body.couponCode,
            discountPercentage: req.body.discountPercentage,
            maxDiscountAmount:req.body.maxDiscountAmount,
            expiryDate: req.body.expiryDate,
            criteriaAmount: req.body.criteriaAmount,
            })
    
            res.redirect("/admin/coupon")

    } catch (error) {
        console.log(error.message);
    }
  },
  checkcouponPost:async(req,res)=>{
    try {
      const userId=req.session.user_id;
      const couponcode=req.body.coupon;
      const currentDate=new Date()
      const cartData=await Cart.findOne({user:userId})
      const cartTotal=await cartData.product.reduce((acc,val)=>acc+val.totalPrice,0)
      const coupondata=await Coupon.findOne({couponCode:couponcode})
      console.log(coupondata,'coupon undo');
      if(coupondata){
        if(currentDate>=coupondata.activationDate && currentDate<=coupondata.expiryDate){
          const exist=coupondata.usedUsers.includes(userId)
          console.log("User Users:", coupondata.userUsers);
          if(!exist){
            if(cartTotal>=coupondata.criteriaAmount){
              await Coupon.findOneAndUpdate({couponCode:couponcode},{$push:{userUsers:userId}})
              await Cart.findOneAndUpdate({user:userId},{$set:{couponDiscount:coupondata._id}})
              res.json({coupon:true})
            }else{
              res.json({coupon:'amount issue'})
            }

          }else{
            res.json({coupon:'used'})
          }
        }else{
          res.json({coupon:'coupon not active'})
        }

      }else{
        res.json({coupon:false})
      }
    } catch (error) {
      console.log(error);
    }
  },
  removecoupon:async(req,res)=>{
    try {
      const userId=req.session.user_id;
      const cartData=await Cart.findOne({user:userId})
      console.log(cartData,'halohlaohlao');
      await Coupon.findOneAndUpdate({_id:cartData.couponDiscount},{$pull:{usedUsers:userId}})
      await Cart.findOneAndUpdate({user:userId},{$set:{couponDiscount:0}})
      res.json({remove:true})
    } catch (error) {
      console.log(error.message);
        res.render('500Error')
    }
  },

};

