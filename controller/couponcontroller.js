const Coupon = require("../models/couponmodel");

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
};

