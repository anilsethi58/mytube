const express=require('express');
const app=express();
const mongoose=require('mongoose');
require('dotenv').config();
const userRoute=require('./routes/user');
const videoRoute=require('./routes/video');
const commentRoute=require('./routes/comment');
const bodyParser=require('body-parser');
const fileUpload=require('express-fileupload');
const cors =require('cors')

const connectWithDb=async(req,res)=>{
    try {
        const res=await mongoose.connect (process.env.MONGO_URI)
        console.log("**** Database Connected Successfully ****");

    } catch (err) {
        console.log(err);
        
    }
};
connectWithDb()


app.use(cors())
app.use(bodyParser.json())

app.use(fileUpload({
    useTempFiles : true,
}));


//----Routes---------//

app.use('/user',userRoute);
app.use('/video',videoRoute);
app.use('/comment',commentRoute);





module.exports=app;