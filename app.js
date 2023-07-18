const express=require('express');

const app=express();

const path = require('path');

require('dotenv').config();

const bodyParser=require('body-parser');

const cors=require('cors');
app.use(cors({origin:"*"}))


const UserRoutes=require('./routes/users');

const ExpenseRoutes=require('./routes/expense');

const PurchaseRoutes=require('./routes/purchase');

const PremiumRoutes=require('./routes/premium');

const PasswordRoutes=require('./routes/forgotpassword');

const mongoose=require('mongoose');

app.use(bodyParser.json({extended:false}));

app.use('/user',UserRoutes);

app.use('/expense',ExpenseRoutes);

app.use('/purchase',PurchaseRoutes);

app.use('/premium',PremiumRoutes);

app.use('/password',PasswordRoutes);

app.use((req,res)=>{
    res.sendFile(path.join(__dirname,`public/${req.url}`))
})
app.use('/',(req,res,next)=>{
    res.status(404).send("<h1>OOPS! Page Not Found </h1>");
})

mongoose
.connect('mongodb+srv://new-user_1:1234567890@cluster0.43mhdah.mongodb.net/')
.then(()=>{
    console.log("Connected Successfully to MongoDb..");
})
.then(()=>{
    app.listen(process.env.PORT||3000);
}).catch(err=>console.log(err));


