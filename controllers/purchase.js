const Razorpay=require('razorpay');
const Order=require('../models/orders');
const User=require('../models/users');
const jwt=require('jsonwebtoken');

exports.purchasePremium=async (req,res,next)=>{
    try{
        var rp=new Razorpay({
            key_id:process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRET
        })
        const amount=1000;
        console.log(process.env.RAZORPAY_KEY_ID)
       await rp.orders.create({amount,currency:"INR"},(err,order)=>{
            if(err) {
                throw new Error(JSON.stringify(err));
            }
            const neworder =new Order({ orderid: order.id, status: 'PENDING',userId:req.user._id})
            neworder.save()
            .then(() => {
                return res.status(201).json({ order, key_id : rp.key_id});

            }).catch(err => {
                throw new Error(err)
            })
        })
    }
    catch(err){
        console.log(err);
        res.status(404).json({message:'Something went Wrong',error:err})
    }
}
function generateAccessToken(id,name,ispremiumuser){
    return jwt.sign({userId:id,name:name,ispremiumuser},'secretkey');
 } 

exports.updateTransactionStatus= async (req,res,next)=>{
    try {
        const userId = req.user._id;
        const { payment_id, order_id} = req.body;
            console.log(">>>>>>>>>",order_id);
        const promise1 =  Order.findOneAndUpdate({orderid:order_id},{ paymentid: payment_id, status: 'SUCCESSFUL'})
        const promise2 =  User.findByIdAndUpdate({_id:userId},{ ispremiumuser: true }) 
        Promise.all([promise1, promise2])
        .then(()=> {
            return res.status(202).json({success: true, message: "Transaction Successful",token:generateAccessToken(userId,undefined,true)});})
        .catch((error ) => {
            console.log(error);
            throw new Error(error)}) 
    }catch(err){
        console.log(err);
        res.status(402).json({success:false,message:err});
    }
}
