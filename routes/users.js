const express=require('express');
const router=express.Router();
const userControllers=require('../controllers/users');

 router.post('/signup',userControllers.addUsers);

 router.post('/login',userControllers.login);

module.exports=router;
