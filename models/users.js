const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema({
  username:{
   type:String,
   required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  number:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  ispremiumuser:{
    type:Boolean,
    required:true
  },
  totalexpenses:{
    type:Number,
    required:true,
    default:0
  }
})

module.exports=mongoose.model('User',userSchema);