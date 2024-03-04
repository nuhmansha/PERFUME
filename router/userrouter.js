const express = require("express");
const router = express.Router();

const usercontroller=require('../controller/usercontroller')
const productcontroller=require('../controller/Productcontroller')
const cartcontroller=require('../controller/cartcontroller');
const wishlistcontroller = require("../controller/wishlistcontroller");
const addresscontroller=require('../controller/addresscontroller')
const couponcontroller=require('../controller/couponcontroller')
// Parse JSON and URL-encoded data
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


            //  USER SIDE SIGNUP AND LOGIN PAGE 
router.get("/signup",usercontroller. SignupGET);
router.post("/signup", usercontroller.signupPOST);
router.get("/login",usercontroller. loginGET);
router.post("/login",usercontroller. loginPOST);
router.get('/home',usercontroller.homeGET)
router.get('/otp',usercontroller.otpverificationGET)
router.post('/otp',usercontroller.otpverificationPOST)
router.get('/forgot',usercontroller.forgotGET)
router.post('/forgot',usercontroller.forgotPOST)
router.get('/otpforgot',usercontroller.otpforgotGET)
router.post('/otpforgot',usercontroller.otpforgotPOST)
router.get('/resetPassword',usercontroller.resetPasswordGET)
router.post('/resetpassword',usercontroller.resetPasswordPOST)
router.get('/shop',usercontroller.shopGet)
router.get('/account',usercontroller.accountGet)
            //   CART
router.get('/product',productcontroller.userProductGet)
router.get('/search',usercontroller.searchProductGet)
router.get('/cart',cartcontroller.cartGet)
router.patch('/addtocart',cartcontroller.addCart)
router.post('/updatecart',cartcontroller.updateCartPost)
router.post('/removecartitem',cartcontroller.removeCartitemPost)
router.get('/checkout',cartcontroller.checkoutGet)
router.post('/checkcoupon',couponcontroller.checkcouponPost)
router.post('/removecoupon',couponcontroller.removecoupon)

router.post('/addaddress',addresscontroller.addAddressPost)
router.get('/success',addresscontroller.successGet)
router.delete('/deleteaddress',addresscontroller.deleteAddress)
router.post('/addaddresses',addresscontroller.addaddressprofile)
router.post('/editaddresses',addresscontroller.editaddresses)
            //   WISHLIST
router.get('/wishlist',wishlistcontroller.wishlistGet)
router.patch('/addtowishlist',wishlistcontroller.wishlistAdd)
router.post('/removewishlist',wishlistcontroller.removeWishlistPost)
            //   PROFILE
router.post('/edituser',usercontroller.editUserPost)
router.post('/passwordchange',usercontroller.passwordchangeUserPost)


module.exports = router;
