const express=require('express');
const router=express.Router();
const passwordControllers=require('../controllers/forgotpassword');

 router.post('/forgotpassword',passwordControllers.forgotpassword);

 router.get('/resetpassword/:id',passwordControllers.resetpassword);

 router.get('/updatepassword/:id',passwordControllers.updatepassword);

module.exports=router;