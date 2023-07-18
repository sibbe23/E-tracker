const User=require('../models/users');
 const jwt=require('jsonwebtoken');


 exports.authenticate= async (req,res,next)=>{
    try{
        const token=req.header('Authorization');
        const userdata=jwt.verify(token,'secretkey');
        console.log(userdata)
        const user =  await  User.findById(userdata.userId);
        req.user=user;
        next();

    }catch(err){
        res.status(500).json({message:err,success:false});
    }
 }