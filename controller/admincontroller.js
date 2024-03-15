const Admin = require("../models/adminmodel");
const User=require("../models/usermodels")
const Order=require("../models/odermodels")
const bcrypt = require("bcrypt");

require("dotenv").config();

module.exports = {
  SignupGET: (req, res) => {
    res.render("admin/signup");
  },
  signupPOST: async (req, res) => {
    const { name, password, email, mobile, code } = req.body;
    // console.log(name, email);
    try {
      const hashedpassword = await bcrypt.hash(password, 10);

      const admin = await Admin.create({
        name,
        email,
        password: hashedpassword,
        mobile,
      });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).send("Invalid email format");
      }
      const expectedCode = process.env.VERIFICATION_CODE;
      const isValidCode = code === expectedCode;

      if (!isValidCode) {
        return res.status(400).send("Invalid verification code");
      }

      res.redirect("/admin/login");
    } catch (error) {
      console.log("Error in signupPOST", error.message); // Fix the typo here: change "err" to "error"
      res.status(500).json({ error: "Internal server error" });
    }
  },
  loginGET: (req, res) => {
    res.render("admin/login");
  },
  loginPOST: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(email);
      const loginadmin = await Admin.findOne({ email: email });
      if (!loginadmin) {
        return res.status(400).send("Invalid email");
      }
      const passwordValid = await bcrypt.compare(password, loginadmin.password);
      if (!passwordValid) {
        return res.status(400).send("Invalid password");
      }
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log("Error in loginPOST", error.message);
    }
  },
  dashboardGET:async (req, res) => {
    const totalRevenueNumber = []; // Replace with your actual revenue value

    const ordercount = []; // Replace with your actual order count

    const productcount = []; // Replace with your actual product count

    const categorycount = []; // Replace with your actual category count

    const monthlyRevenueNumber = []; // Replace with your actual monthly revenue

    const orders = await Order.find().populate('userId')

    res.render("admin/dashboard", {
      totalRevenueNumber,
      ordercount,
      productcount,
      categorycount,
      monthlyRevenueNumber,
      orders,
    });
  },
  userviewGET:async(req,res)=>{
    try {
    const userData=await User.find();
    res.render('admin/users',{users:userData})
    } catch (error) {
        console.log(error.message);
    }
  },


};
