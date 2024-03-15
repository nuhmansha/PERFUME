const Product = require("../models/productmodels");
const sharp = require("sharp");
const Category = require("../models/categorymodels");
const User = require("../models/usermodels");
const Cart=require('../models/cartmodels');
const Review=require('../models/reviewmodels')

module.exports = {
  productGET: async (req, res) => {
    try {
      const products = await Product.find({});
      res.render("admin/product", { products });
    } catch (error) {}
  },
  addproductGET: async (req, res) => {
    try {
      const categoryData = await Category.find({});
      res.render("admin/addproduct", { category: categoryData });
    } catch (error) {
      console.log(error.message);
    }
  },
  addproductPOST: async (req, res) => {
    try {
      // Extract product details from request body
      const { name, description, price, quantity, category, offer } = req.body;
      console.log(req.body);

      // Extract filenames of uploaded images
      const imageFilenames = req.files.map((file) => file.filename);

      // Resize and save images if needed
      for (const filename of imageFilenames) {
        await sharp("public/assets/images/products/original/" + filename)
          .resize(500) // Resize images if needed
          .toFile("public/assets/images/products/sharpened/" + filename); // Save resized images
      }
      // Create new product object with details and image filenames
      const product = new Product({
        name,
        description,
        price,
        quantity,
        category,
        offer,
        image: imageFilenames, // Add image filenames to product
      });
      await product.save();

      res.redirect("/admin/product");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  editproductGet: async (req, res) => {
    try {
      const productid = req.query.id;
      const productData = await Product.findOne({ _id: productid });
      const categoryData = await Category.find({});
      res.render("admin/editproduct", {
        product: productData,
        category: categoryData,
      });
    } catch (error) {
      console.log(error);
    }
  },
  editproductPost: async (req, res) => {
    try {
      const _id = req.query.id;
      const { name, description, price, quantity, category, offer } = req.body;

      const imageFilenames = req.files.map((file) => file.filename);

      // Resize and save images if needed
      for (const filename of imageFilenames) {
        await sharp("public/assets/images/products/original/" + filename)
          .resize(500) // Resize images if needed
          .toFile("public/assets/images/products/sharpened/" + filename); // Save resized images
      }
      await Product.findByIdAndUpdate(
        { _id },
        {
          name,
          description,
          price,
          quantity,
          category,
          offer,
          $push: { image: { $each: imageFilenames } },
        }
      );
      res.redirect("/admin/product");
    } catch (error) {
      console.log(error.message);
    }
  },
  deleteproductGet: async (req, res) => {
    try {
      const _id = req.params.id;
      const product = await Product.findById({ _id });

      if (!product) {
        return res.render("admin/product", { message: "product not found" });
      } else {
        await Product.findByIdAndDelete({ _id });
        console.log("product delete successfully");
      }
      res.redirect("/admin/product");
    } catch (error) {
      console.log(error.message);
    }
  },

  // USER
  userProductGet: async (req, res) => {
    try {
      const userData = await User.findOne({_id:req.session.user_id})
      console.log(userData,'hooooo');
      const id = req.query.id;
      console.log(id);
      const product = await Product.findOne({_id: id});
      console.log(product)
      const review = await Review.find({productId:id}).populate('userId')
      const cartData = await Cart.findOne({ user:req.session.user_id }).populate("product.productId");

      
      res.render("user/product", { product,user:userData,cart:cartData,review});
    } catch (error) {
      console.log(error);
    }
  },
 
};
