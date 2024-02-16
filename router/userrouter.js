const express = require("express");
const router = express.Router();

// const usercontroller=require('../controller/usercontroller')
// Parse JSON and URL-encoded data
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const {
  SignupGET,
  signupPOST,
  loginGET,
  loginPOST,
  homeGET,
  otpverificationGET,
  otpverificationPOST,
  forgotGET,
  forgotPOST,
  otpforgotGET,
  otpforgotPOST,
  resetPasswordGET,
  resetPasswordPOST,
} = require("../controller/usercontroller");

router.get("/signup", SignupGET);
router.post("/signup", signupPOST);
router.get("/login", loginGET);
router.post("/login", loginPOST);
router.get('/home',homeGET)
router.get('/otp',otpverificationGET)
router.post('/otp',otpverificationPOST)
router.get('/forgot',forgotGET)
router.post('/forgot',forgotPOST)
router.get('/otpforgot',otpforgotGET)
router.post('/otpforgot',otpforgotPOST)
router.get('/resetPassword',resetPasswordGET)
router.post('/resetpassword',resetPasswordPOST)


module.exports = router;
