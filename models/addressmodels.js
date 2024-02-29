const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId


const addressSchema = new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:"users",
        required:true,
    },
    address:[{
        fullName:{
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
          },
          housename: {
            type: String,
            required: true
          },
          state: {
            type: String,
            required: true
          },
          city: {
            type: String,
            required: true
          },
          pincode: {
            type: String,
            required: true
          },
          phone: {
            type: String,
            required: true
          },
          email: {
            type: String,
            required: true
          }
    }]
    
})

module.exports = mongoose.model('addresses',addressSchema) 