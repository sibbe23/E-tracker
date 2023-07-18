
const Expense=require('../models/expense');
const User=require('../models/users');
const Downloadfile=require('../models/downlodedfile')
const AWS=require('aws-sdk');
const mongoose = require('mongoose');

function isStringInvalid(string){
    if(string.length===0 || string==undefined)
    return true;
    else return false;
}

exports.addExpense=async(req,res,next)=>{
    const session= await mongoose.startSession();
    session.startTransaction();
    try{
        const {amount,date,reason,category}=req.body;
        if(isStringInvalid(amount)||isStringInvalid(date)||isStringInvalid(reason)||isStringInvalid(category))
        {
            return res.status(500).json({message:'Bad Parmeters:Something is Missing',success:false})
        }
       const response= new Expense({ amount:amount,date:date, reason:reason, category:category, userId:req.user._id })
        await response.save({session});
       const totalExpense=Number(req.user.totalexpenses) + Number(amount);
       const user =await User.findOne({_id:req.user._id}).session(session);
       user.totalexpenses=totalExpense;
       await user.save({session});
        await session.commitTransaction();
        res.status(201).json({message:response,success:true,totalExpense:totalExpense});
    } catch(err) {
         await session.abortTransaction();
        console.log(err);
        res.status(500).json({message:"Something went wrong",success:false})
    }
    finally{session.endSession()}
}
exports.getExpenses=async(req,res,next)=>{
    try{
        const page=+req.query.page||1;
        const limit=+req.query.limit||5;
        const totalExpense=req.user.totalexpenses;
       const total= await Expense.count({userId:req.user._id});
       const response =await Expense.find({userId:req.user._id}).
        skip((page-1)*limit).
        limit(limit)
        res.status(200).json({message:response,
            success:true,
            currentpage:page,
            nextpage:page+1,
            previouspage:page-1,
            hasnextpage:limit*page<total,
            haspreviouspage:page>1,
            lastpage:Math.ceil(total/limit),
            totalExpense:totalExpense
        })}
    catch(err){res.status(500).json({message:err,success:false});}
}

exports.deleteExpense=async(req,res,next)=>{
    const session= await mongoose.startSession();
    session.startTransaction();
    try{
        const id=req.params.id;
       if(isStringInvalid(id))
       {
        return  res.status(500).json({message:'something went wrong',success:false})
       }
        const user= await Expense.findOne({userId:req.user._id,_id:id})
        const response=await Expense.findByIdAndDelete({_id:id},{session})
        const totalExpense=Number(req.user.totalexpenses)-Number(user.amount);
        await User.updateOne({_id:req.user._id},{totalexpenses:totalExpense},{session});
        await session.commitTransaction();
        if(response===0){
           return  res.status(401).json({message:"Expense does not Belongs to User",success:false});
        }
        res.status(200).json({message:response,success:true,totalExpense:totalExpense});
    }
    catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({message:err,success:false});
    }
    finally{session.endSession()}
}

function uploadToS3(data,fileName){

        const BUCKET_NAME= process.env.AWS_BUCKET_NAME;
        const IAM_USER_KEY= process.env.AWS_KEY_ID;
        const  IAM_USER_SECRET= process.env.AWS_SECRET_KEY;
    
        let s3bucket=new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey:IAM_USER_SECRET,
        })
         var params={
                Bucket:BUCKET_NAME,
                Key:fileName,
                Body:data,
                ACL:'public-read'
            }
           return new Promise((resolve, reject) => {
                s3bucket.upload(params,(err,s3response)=>{
                    if(err){
                        console.log("SOMETHING WENT WRONG",err)
                        reject(err);
                    } 
                    else{
                        resolve(s3response.Location)
                        }
                    })
           })      
   
    
}

exports.downloadExpenses=async(req,res,next)=>{
        try{
            const Expenses= await Expense.find({userId:req.user._id});
            const  stringifiedExpenses=JSON.stringify(Expenses);
            const userId= req.user._id;
            const fileName=`Expenses${userId}/${new Date()}.txt`;
            const fileURL= await uploadToS3(stringifiedExpenses,fileName);
            const downloadfile=new  Downloadfile({url:fileURL,userId:req.user._id});
            await downloadfile.save();
            res.status(200).json({fileURL,success:true})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message:err,success:false});
        }
}


exports.downlodedExpenses=async(req,res,next)=>{
    try{
      const downlodedfiles = await Downloadfile.find({userId:req.user._id}).limit(5);
        res.status(200).json({success:true,message:downlodedfiles})
    }catch(err){
        console.log(err);
        res.status(500).json({success:false,message:err})
    }
}