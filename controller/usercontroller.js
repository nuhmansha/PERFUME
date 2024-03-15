const User = require("../models/usermodels");
const Address=require('../models/addressmodels')
const Coupon=require('../models/couponmodel')
const Product = require("../models/productmodels");
const Category=require('../models/categorymodels')
const Banner=require("../models/bannermodels")
const Cart=require("../models/cartmodels")
const Wishlist=require('../models/wishlistmodels')
const Order=require('../models/odermodels')


const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");


// OTP
const sendOtpVerificationEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      auth: {
        user: process.env.email_user,
        pass: process.env.password_user,
      },
    })
  );

  const mailOptions = {
    from: " process.env.email_user",
    to: email,
    subject: "Verify Your Email",
    text: `Your OTP for signup is ${otp}.`,
  };

  await transporter.sendMail(mailOptions);
};

// FORGOT
const sendResetPasswordEmail = async (email, otp, resetToken) => {
  const user = await User.findOne({ email });

  if (!user) {
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

// **************

module.exports = {
  SignupGET: (req, res) => {
    res.render("user/signup");
  },
  signupPOST: async (req, res) => {
    const { name, password, email, mobile } = req.body;
    console.log(email);
    try {
      const hashedpassword = await bcrypt.hash(password, 10);

      // Generate OTP
      const otp = generateOTP();

      // Save user with OTP
      const user = await User.create({
        name,
        email,
        password: hashedpassword,
        role: "user",
        otp,
        mobile,
      });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).send("Invalid email format");
      }

      // Send OTP via email
      await sendOtpVerificationEmail(email, otp);

      res.redirect(`/user/otp?id=${user._id}`);
      //  res.render("otp", { id: user._id, email: email });
    } catch (err) {
      console.log("error signupPOST", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  loginGET: (req, res) => {
    res.render("user/login");
  },
  loginPOST: async (req, res) => {
    try {
      const { email, password } = req.body;
      const loginuser = await User.findOne({ email: email });
      if (!loginuser) {
        return res.status(400).send("Invalid email");
      }
      const passwordValid = await bcrypt.compare(password, loginuser.password);
      if (!passwordValid) {
        return res.status(400).send("Invalid password");
      }
      req.session.user_id = loginuser._id;
      console.log(loginuser._id);

      // Redirect all users to the same home page
      res.redirect("/user/home");
    } catch (error) {
      console.log("Error in loginPOST", error.message);
    }
  },
  homeGET: async (req, res) => {
    try {
      const user_id = req.session.user_id;
      console.log(user_id,'hai');
  
      // Fetch necessary data (e.g., banners, products, cart)
      const banner = await Banner.find({});
      const userData = await User.findOne({ _id: user_id });
      const product = await Product.find({});
  
      // Fetch cart data and populate the associated product details
      const cartData = await Cart.findOne({ user: user_id }).populate("product.productId");
      const wishlistData=await Wishlist.findOne({user:user_id}).populate("product.productId");
  
      res.render("user/home", { banner, product, user: userData, cart:cartData,wishlistData });
    } catch (error) {
      console.error("Error in homeGET:", error.message);
      res.status(500).send("Internal Server Error");
    }
  },

  otpverificationGET: (req, res) => {
    try {
      const id = req.query.id;
      res.render("user/otp", { id });
    } catch (error) {
      console.log(error.message);
    }
  },
  otpverificationPOST: async (req, res) => {
    try {
      const { id, otp } = req.body;

      // Find the user by ID
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).send("User not found");
      }
      // Check if the entered OTP matches the stored OTP
      if (otp !== user.otp) {
        // console.log(otp, "hai");
        return res.status(400).send("Invalid OTP");
      }
      // Update user's status to verified or perform any other necessary actions
      user.isOtpVerified = true;
      user.otp = null;
      await user.save();

      // Redirect or send a response indicating successful verification
      res.redirect("/user/login"); // Redirect to the login page or any other page
    } catch (error) {
      console.log("Error in otpverificationPOST", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  forgotGET: (req, res) => {
    try {
      res.render("user/forgot");
    } catch (error) {
      console.log(error);
    }
  },
  forgotPOST: async (req, res) => {
    const { email } = req.body;
    // req.session.id=email

    try {
      // Generate OTP
      const otp = generateOTP();

      // Fetch user by email
      const user = await User.findOne({ email });

      if (!user) {
        // Handle case where the email is not found
        return res.status(404).send("User not found");
      }
      req.session.email = email;
      // Save the OTP, token, and expiration to the user
      // const resetToken = crypto.randomBytes(32).toString("hex");
      // const resetTokenExpiration = Date.now() + 300000; // Token expiration time (1 hour)

      // user.resetToken = resetToken;
      // user.resetTokenExpiration = resetTokenExpiration;
      user.otp = otp;
      await user.save();

      // Send reset password email with OTP
      await sendResetPasswordEmail(email, otp);

      // Redirect to OTP verification page with user id
      res.redirect(`/user/otpforgot?id=${user._id}`);
    } catch (error) {
      console.error("Error in forgot-password route:", error);
      res.status(500).send("Internal server error");
    }
  },
  otpforgotGET: (req, res) => {
    try {
      const id = req.query.id;
      res.render("user/otpforgot", { id });
    } catch (error) {
      console.log(error.message);
    }
  },
  otpforgotPOST: async (req, res) => {
    try {
      const { id, otp } = req.body;

      // Find the user by ID
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if the entered OTP matches the stored OTP
      if (otp !== user.otp) {
        // console.log(otp, "hai");
        return res.status(400).send("Invalid OTP");
      }
      user.isOtpVerified = true;

      await User.updateOne({ _id: id }, { $set: { isOtpVerified: true } });

      // Redirect or send a response indicating successful verification
      res.redirect("/user/resetPassword"); // Redirect to the password reset page or any other page
    } catch (error) {
      console.log("Error in otpforgotPOST", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  resetPasswordGET: (req, res) => {
    try {
      const token = req.params.token;
      res.render("user/resetPassword", { token });
    } catch (error) {
      console.log(error.message);
    }
  },
  resetPasswordPOST: async (req, res) => {
    try {
      const { password1, password2 } = req.body;
      const email = req.session.email[1];
      // Validate that passwords match
      if (password1 !== password2) {
        return res.status(400).send("Passwords do not match");
      } else if (password1 == password2) {
        const password = await bcrypt.hash(password1, 10);
        await User.updateOne({ email }, { $set: { password: password } });
        res.redirect("/user/login");
      }

    } catch (error) {
      console.error("Error in resetPasswordPOST", error.message);
      res.status(500).send("Internal server error");
    }
  },
  searchProductGet:async(req,res)=>{
    console.log('hau');
    try {
      const productname=req.query.q
      console.log(productname);
      const matchproduct=await Product.find({
        name:{$regex:productname,$options:'i'}
      })
      console.log(matchproduct.length);
        res.json({ suggestions: matchproduct });
        // res.redirect(`/user/product?search=${productname}`);

    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  shopGet:async(req,res)=>{
    try {
      const user_id = req.session.user_id;
      console.log(user_id,'in shop');
      const cart = await Cart.findOne({ user: req.session.user_id }).populate("product.productId");
      const category = await Category.find()
      const product = await Product.find()
      res.render('user/shop',{product,totalPages:'',category,cart})
  } catch (error) {
      console.log(error);
  }

  },
  accountGet:async(req,res)=>{
    try {
      const userData = await User.findOne({_id:req.session.user_id})
      console.log(userData,'in account');
      const  addresses = await Address.findOne({user:req.session.user_id})
      console.log(addresses);
      const orders = await Order.find({userId:req.session.user_id}).sort({purchaseDate:-1})
      const CouponData = await Coupon.find({})
      console.log(CouponData);
     const user = req.session.user_id
     console.log(user);

      // console.log(addresses);
      // console.log(req.session.user_id);
      res.render('user/account',{userData,addresses,orders:orders,CouponData,user})
  } catch (error) {
      console.log(error);
  }

  },
  editUserPost: async (req, res) => {
    try {
      console.log("131")
          const userData = await User.findById(req.session.user_id)

     await User.findOneAndUpdate(
          { email: userData.email,  },
          {
              $set: {
                  name:req.body.editname,
                  mobile:req.body.editmobile,
                  email:req.body.editemail,
              },
          },
          { new: true }
      );
      res.redirect('/user/account')
  } catch (error) {
      console.log(error);
  }
},
passwordchangeUserPost:async(req,res)=>{
  try {
    const userData = await User.findById(req.session.user_id);
    console.log(userData);

    const matchPassword = await bcrypt.compare(req.body.currentpassword, userData.password);

    if (matchPassword) {
      const hashedPassword = await bcrypt.hash(req.body.newpassword, 10);
              await User.findOneAndUpdate(
            { email: userData.email },
            {
                $set: {
                    password:hashedPassword 
                },
            },
            { new: true }
        );
        return res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } else {
        return res.status(401).json({ success: false, message: 'Current password is incorrect. Please try again.' });
    }
} catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'An error occurred while updating the password. Please try again.' });
}

},
// invoiceGet:async(req,res)=>{
//   try {
//     const productId = req.query.productId;
//     const orderId = req.query.orderId;
//     console.log(productId,orderId)
//     const orderData = await Order.findOne({_id:orderId}).populate('userId')
//     const productsData = await Promise.all(
//       orderData.products.map(async (product) => {
//         const productDetails = await Product.findOne({ _id: product.productId });
//         return {
//           ...product.toObject(),
//           productDetails,
//         };
//       })
//     );       
//     console.log(productsData,"details")
//     const projectRoot = path.join(__dirname, '..');

//     const invoiceTemplatePath = path.join(projectRoot, 'views', 'user', 'invoice.ejs');
//     const htmlContent = await ejs.renderFile(invoiceTemplatePath, { productsData ,orderData});

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.setContent(htmlContent);

//     const pdfBuffer = await page.pdf();

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=invoice.pdf`);
//     res.send(pdfBuffer);

//     await browser.close();
//   } catch (error) {
//     console.error('Error generating invoice:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// }

 
  
};
