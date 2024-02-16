const Category=require("../models/categorymodels")


module.exports ={
categoriesGET:async(req,res)=>{
    try {
      const category = await Category.find({})
      res.render('admin/categories',{category})
    } catch (error) {
      console.log(error);
    }
  },
  addcategoryGET:async(req,res)=>{
    try {
      res.render('admin/addcategory')
    } catch (error) {
      console.log(error);
    }
  },
  addcategoryPOST:async(req,res)=>{
    try {
      const {name,description}=req.body
      
      const existcategory=await Category.findOne({name})
      if(existcategory){
        return res.render('admin/addcategory', { error: 'Category Name already exists' });
      }
      const category=new Category({name,description})
      
      await category.save()
      
      res.redirect('/admin/categories');
    } catch (error) {
      console.log(error);
    }
    
  },
  editcategoryGET:async(req,res)=>{
    try {
      const categoryid=req.query.id
      const categoryData =await Category.findById(categoryid)
      res.render('admin/editcategory', {categoryData :categoryData});
    } catch (error) {
      console.log(error);
      
    }
  },
  editcategoryPOST:async(req,res)=>{
    try {
      const _id=req.body.id;
      const {name,description}=req.body;
      const categorydatas= await Category.findById({_id})
      const exists=await Category.findOne({name})
      if(exists){
        return res.render('admin/editcategory', { message: 'Duplicate key not allowed', categoryData: categorydatas });

      }
      await Category.findByIdAndUpdate({_id},{$set:{name:name,description:description}});

      res.redirect('/admin/categories')

    } catch (error) {
      console.log(error.message);
    }
  },
  deletecategoryGET:async(req,res)=>{
    try {
      const _id=req.params.id;
      // console.log(_id);
      const category=await Category.findById({_id})
      
      if(!category){
        return res.render('admin/categories',{message:'category not found'})
      }
      else{
        await  Category.findByIdAndDelete({_id})
        console.log('category delete successfully');
      }
      res.redirect('/admin/categories')
    } catch (error) {
      console.log(error.message);
    }
  },
  
}