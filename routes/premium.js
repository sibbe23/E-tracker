const express=require('express');
const premiumControllers=require('../controllers/premium')
const router=express.Router();

router.get('/leaderboard',premiumControllers.showLeaderBoard);

module.exports=router;