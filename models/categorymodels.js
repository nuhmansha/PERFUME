const mongoose = require("mongoose");
 const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    is_list:{
        type:Boolean,
        default:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
 })

 module.exports = mongoose.model("categories",categorySchema);