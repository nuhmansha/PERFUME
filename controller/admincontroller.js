const Admin = require("../models/adminmodel");
const User=require("../models/usermodels")
const Product=require("../models/productmodels")
const Category=require("../models/categorymodels")
const Order=require("../models/odermodels")
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");


require("dotenv").config();

// FORGOT
const sendResetPasswordEmail = async (email, otp) => {
  const admin = await Admin.findOne({ email });

  if (!admin) {
    // Handle case where the email is not found
    return;
  }
  // const otp = generateOTP();

  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      auth: {
        user: process.env.email_user,
        pass: process.env.password_user,
      },
       tls: {
          rejectUnauthorized: false, // Ignore SSL certificate errors
        },
    })
  );

  const mailOptions = {
    from: process.env.email_user,
    to: email,
    subject: "Reset Your Password",
    html: `<p>You requested a password reset. Your OTP is ${otp}.`,
  };

  await transporter.sendMail(mailOptions);
};
const generateOTP = () => {
  return `${Math.floor(1000 + Math.random() * 9000)}`;
};

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
  adminForgot:async(req,res)=>{
    try {
      res.render("admin/forgot")
    } catch (error) {
      console.log(error);
    }
  },
  adminForgotPost:async(req,res)=>{
    const { email } = req.body;
    // req.session.id=email

    try {
      // Generate OTP
      const otp = generateOTP();
      console.log(otp,"gen");

      req.session.adminOTP = otp;
      req.session.email = email;
      console.log(email);

      // Fetch user by email
      const admin = await Admin.findOne({ email });

      if (!admin) {
        // Handle case where the email is not found
        return res.status(404).send("admin not found");
      }
      
     

      // Send reset password email with OTP
      await sendResetPasswordEmail(email, otp);

      // Redirect to OTP verification page with user id
      res.redirect(`/admin/otpforgot?id=${admin._id}`);
    } catch (error) {
      console.error("Error in forgot-password route:", error);
      res.status(500).send("Internal server error");
    }
  },
  adminOtpForgot: (req, res) => {
    try {
      const id = req.query.id;
      res.render("admin/otpforgot", { id });
    } catch (error) {
      console.log(error.message);
    }
  },
  adminOtpverification:async(req,res)=>{
    try {
      const { id, otp } = req.body;
      const storedOTP = req.session.adminOTP;
      console.log(storedOTP,"storedOTP");

      if (otp !== storedOTP) {
          return res.status(400).send("Invalid OTP");
      }
      // If OTP is valid, clear it from the session
      req.session.adminOTP = null;

      // Redirect or send a response indicating successful verification
      res.redirect("/admin/resetPassword"); // Redirect to the password reset page or any other page
  } catch (error) {
      console.log("Error in otpforgotPOST", error.message);
      res.status(500).json({ error: "Internal server error" });
  }

  },
  adminResetPassword:async(req,res)=>{
    try {
      res.render("admin/resetPassword");
    } catch (error) {
      console.log(error.message);
    }

  },
  adminResetPasswordPost:async(req,res)=>{
    try {
      const { password1, password2 } = req.body;
      console.log(req.body);
      
      // Validate that passwords match
      if (password1 !== password2) {
        return res.status(400).send("Passwords do not match");
      } else if (password1 == password2) {
        const password = await bcrypt.hash(password1, 10);
        const email = req.session.email[1];
        await Admin.updateOne({ email }, { $set: { password: password } });
        res.redirect("/admin/login");
      }

    } catch (error) {
      console.error("Error in resetPasswordPOST", error.message);
      res.status(500).send("Internal server error");
    }

  },
  dashboardGET:async (req, res) => {
    try {
      const ordercount = await Order.countDocuments();
      const productcount = await Product.countDocuments();
      const categorycount = await Category.countDocuments();
      const order = await Order.find().populate('userId');

      const totalrevenue = await Order.aggregate([
          {
              $match: {
                  'products.productstatus': 'Delivered' 
              }
          },
          {
              $group: {
                  _id: null,
                  totalrevenue: { $sum: "$totalAmount" }
              }
          }
      ]);

      const totalRevenueNumber = totalrevenue.map(result => result.totalrevenue)[0] || 0;

      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

      const monthlyrevenue = await Order.aggregate([
          {
              $match: {
                  'products.productstatus': 'Delivered', 
                  purchaseDate: {
                      $gte: startOfMonth,
                      $lt: endOfMonth
                  }
              }
          },
          {
              $group: {
                  _id: null,
                  monthlyrevenue: { $sum: "$totalAmount" }
              }
          }
      ]);
      
      const monthlyRevenueNumber = monthlyrevenue.map(result => result.monthlyrevenue)[0] || 0;
      // console.log(ordercount,"1", productcount,"2", categorycount,"3", totalRevenueNumber,"4", monthlyRevenueNumber,"5", order,"hasjkdfhaksjlf");
      // console.log(totalRevenueNumber,monthlyRevenueNumber);
      
      res.render('admin/dashboard', { ordercount, productcount, categorycount, totalRevenueNumber, monthlyRevenueNumber, order });
  } catch (error) {
      console.log(error);
  }
  },
  userviewGET:async(req,res)=>{
    try {
    const userData=await User.find();
    res.render('admin/users',{users:userData})
    } catch (error) {
        console.log(error.message);
    }
  },
  chartData:async(req,res)=>{
    try {
      const salesData = await Order.aggregate([
          {
              $match: { "products.productstatus": "Delivered" }
          },
          {
              $group: {
                  _id: { $month: "$purchaseDate" },
                  totalAmount: { $sum: "$totalAmount" },
                  count:{$sum:1}
              },
          },
          {
              $project: {
                  _id: 0,
                  month: "$_id",
                  totalAmount: 1,
                  count:1
              },
          },
          {
              $sort: { month: 1 },
          },
      ]);

      console.log(salesData,'123');

      res.json(salesData);
  } catch (error) {
      console.error('Error fetching data from database:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
  },
  paymentChart:async(req,res)=>{
    try {
      const paymentData = await Order.aggregate([
          {
              $match: { "products.productstatus": "Delivered" }
          },
          {
              $group: {
                  _id: "$paymentMethod",
                  totalAmount: { $sum: "$totalAmount" },
              }
          },
      ]);

      console.log(paymentData,"789");

      res.json(paymentData);
  } catch (error) {
      console.error('Error fetching payment data from the database:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
  },
  


};
