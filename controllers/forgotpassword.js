
const uuid=require('uuid');
const User=require('../models/users')
const ForgotPassword=require('../models/forgotpassword')
const sgMail = require('@sendgrid/mail');
const bcrypt=require('bcrypt');

exports.forgotpassword= async(req,res,next)=>{
        try {
            const {email}  =  req.body;
            const user = await User.findOne({email: email });
            console.log(user);
            if(user){
                const id = uuid.v4();
               const forgotPassword = new ForgotPassword({id:id,isactive:true,userId:user._id})
                    await forgotPassword.save();
                sgMail.setApiKey(process.env.SENGRID_API_KEY)
                const msg = {
                    to: email,
                    from: process.env.FROM_EMAIL, 
                    subject: 'Reset Password',
                    text: 'Click the link below to reset your password!  ',
                    html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
                }
                sgMail
                .send(msg)
                .then((response) => {
                    return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail ', success: true})
                })
                .catch((err) => {
                    console.log(">>>>>>>>",err);
                    return res.status(500).json({ message: err, success: false });
                })
            }else {
                return res.status(500).json({ message:"User does Not Exist", success: false });
            }
        } catch(err){
            return res.status(500).json({ message: err, success: false });
        }
}

exports.resetpassword=async(req,res,next)=>{
    try{
        const uuid=req.params.id;
     const forgotpasswordrequest = await  ForgotPassword.findOne({id:uuid})
    if(forgotpasswordrequest){
          await forgotpasswordrequest.updateOne({isactive:false})
            res.status(200).send(`<html>
            <script>
                function formsubmitted(e){
                    e.preventDefault();
                }
            </script>
            <form action="/password/updatepassword/${uuid}" method="get">
                <label for="newpassword">Enter New password</label>
                <input name="newpassword" type="password" required></input>
                <button>Reset password</button>
            </form>
        </html>`
        )
res.end()
    }
    else{
        throw new Error("invalid uuid")
    }
    }
    catch(err){
        res.status(500).json({message:err,success:false})
    }
}

exports.updatepassword= async (req,res,next)=>{
        try {
            const { newpassword } = req.query;
             console.log('>>>>>',newpassword); 
            const  resetpasswordid  = req.params.id;
             console.log('>>>>>',resetpasswordid);
           const resetpasswordrequest= await  ForgotPassword.findOne({ id: resetpasswordid })
              const user= await  User.findOne({ _id : resetpasswordrequest.userId})
              console.log(">>>>>>>>>>>",user);
                    if(user) {
                        const saltRounds = 10;
                            bcrypt.hash(newpassword,saltRounds,function(err, hash){
                                if(err){
                                    console.log(err);
                                  return res.status(500).json({message:err})
                                }
                               User.updateOne({_id:user._id},{ password: hash }).then(() => {
                                    res.status(201).json({message: 'Successfuly updated the new password'})
                                }).catch((err)=>{
                                   return res.status(500).json({message:err})
                                })
                            });
                } else{
                    return res.status(404).json({message:'No user Exists', success: false})
                }
        } catch(error){
            return res.status(403).json({ message:error, success: false } )
        }
    }
    
    

