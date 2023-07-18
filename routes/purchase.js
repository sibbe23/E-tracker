const express=require('express');
const router=express.Router();
const purchaseControllers=require('../controllers/purchase');
const userAuthentication=require('../middleware/authorization');

 router.get('/premiummembership',userAuthentication.authenticate,purchaseControllers.purchasePremium);

 router.post('/updatetransactionstatus',userAuthentication.authenticate,purchaseControllers.updateTransactionStatus);

module.exports=router;