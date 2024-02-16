const mongoose = require('mongoose');

const userSchema  = mongoose.Schema({
 name:{
      type:String,
      required:true
  },
  email:{
      type:String,
      required:true
  },
  mobile:{
      type:String,
      required:false
  },
  password:{
      type:String,
      required:true,
  },
  role:{
    type:String
 }
  

  
}); 

module.exports = mongoose.model('Admin',userSchema); 