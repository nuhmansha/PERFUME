const express = require("express");
const router = express.Router();

const productcontroller=require('../controller/Productcontroller')
const categoriescontroller=require('../controller/categoriescontroll')
const Bannercontroller = require("../controller/Bannercontroller");
const admincontroller=require("../controller/admincontroller")
const couponcontroller=require("../controller/couponcontroller")
const ordercontroller=require('../controller/odercontroller')

const utils=require("../utils/multer")

const upload=utils.multerstorage();
const uploadbanner=utils.bannerstorage()

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// const { SignupGET, signupPOST,loginGET,loginPOST,dashboardGET,userviewGET,} = require("../controller/admincontroller");

router.get("/signup",admincontroller.SignupGET)
router.post("/signup",admincontroller.signupPOST)
router.get("/login",admincontroller.loginGET)
router.post("/login",admincontroller.loginPOST)
router.get("/dashboard",admincontroller.dashboardGET)
router.get("/users",admincontroller.userviewGET)
        //   BANNER 
router.get("/banner",Bannercontroller.BannerGET)
router.get("/addbanner",Bannercontroller.addBannerGet)
router.post("/addbanner",uploadbanner.single('image'),Bannercontroller.addBannerPost)
router.get("/editbanner",Bannercontroller.editBannerGet)
router.post("/editbanner",uploadbanner.single('image'),Bannercontroller.editBannerPost)
router.get("/deletebanner/:id",Bannercontroller.deleteBannerGet)
    //    PRODUCT 
router.get('/product',productcontroller.productGET)
router.get('/addproduct',productcontroller.addproductGET)
router.post('/addproduct',upload.array('image1',4),productcontroller.addproductPOST)
router.get('/editproduct',productcontroller.editproductGet)
router.post('/editproduct',upload.array('image1',4),productcontroller.editproductPost)
router.get('/deleteproduct/:id',productcontroller.deleteproductGet)
    // CATEGORY
router.get('/categories',categoriescontroller.categoriesGET)
router.get('/addcategory',categoriescontroller.addcategoryGET)
router.post('/addcategory',categoriescontroller.addcategoryPOST)
router.get('/editcategory',categoriescontroller.editcategoryGET)
router.post('/editcategory',categoriescontroller.editcategoryPOST)
router.get('/deletecategory/:id',categoriescontroller.deletecategoryGET)

    //COUPON
router.get('/coupon',couponcontroller.couponGet)
router.get('/addcoupon',couponcontroller.addCouponGet)
router.post('/addcoupon',couponcontroller.addCouponPost)
router.get('/editcoupon',couponcontroller.editCouponGet)
router.post('/editcoupon',couponcontroller.editCouponPost)

    //    ORDERS
router.get('/order',ordercontroller.adminOrdersView)    


module.exports = router;


