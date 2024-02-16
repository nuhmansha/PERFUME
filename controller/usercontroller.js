const User = require("../models/usermodels");
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

      // Redirect all users to the same home page
      res.redirect("/user/home");
    } catch (error) {
      console.log("Error in loginPOST", error.message);
    }
  },
  homeGET: (req, res) => {
    const bannerData = []; // Replace this with your actual banner data
    res.render("user/home", { banner: bannerData });
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
};
