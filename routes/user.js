const express =require ('express');
const Router =express.Router();
const bcrypt=require('bcrypt');
require('dotenv').config();
const User= require('../models/User');
const mongoose= require('mongoose');
const { reset } = require('nodemon');
const cloudinary=require('cloudinary').v2
const jwt=require('jsonwebtoken');
const checkAuth=require('../middleware/checkAuth');


 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME ,
    api_key: process.env.API_KEY,  
    api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});


Router.post('/signup',async(req,res)=>{
    try {
        const users=await User.find({email:req.body.email})
        if(users.length>0){
            return res.status(500).json({
                error:'email already exists'
            });
        }
        const hashCode= await bcrypt.hash(req.body.password,10);
        const uploadedImage= await cloudinary.uploader.upload(req.files.logo.tempFilePath);
        console.log(uploadedImage,hashCode);
        const newUser=new User({
            _id:new mongoose.Types.ObjectId,
            channelName:req.body.channelName,
            email:req.body.email,
            phone:req.body.phone,
            password:hashCode,
            logoUrl:uploadedImage.secure_url,
            logoId:uploadedImage.public_id

        });
            const user= await  newUser.save();
            res.status(200).json({
                newUser:user
            })        
       

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })
        
    }
    
})

Router.post('/login',async(req,res)=>{

    try {
        // console.log (req.body);
       const users =await User .find({email:req.body.email});
    //    console.log(users);

       if (users.length==0){
        return  res.status(500).json({
            erroe:'email is not registred...'
        })
       }
       const isValid=await bcrypt.compare(req.body.password,users[0].password)
       console.log(isValid);
       if(!isValid){
        return res.status(500).json({
            error:'invalid Password'
        })
       }
//create JWT webtoken
       const token=jwt.sign({
        _id:users[0]._id,
        channelName:users[0].channelName,
        email:users[0].email,
        phone:users[0].phone,
        logoId:users[0].logoId
       },
       'anilsethi2024',{
        expiresIn:'365d'
       }

    )
    res.status(200).json({
        _id:users[0]._id,
        channelName:users[0].channelName,
        email:users[0].email,
        phone:users[0].phone,
        logoId:users[0].logoId,
        logoUrl:users[0].logoUrl,
        token:token,
        subscribers:users[0].subscribers,
        subscribedChannels:users[0].subscribedChannels
        
    })
       

    } catch (err) {

        console.log(err);
        res.status(500).json({
            error:'something is wrong'
        })
        
    }
    

})

// --- Subscribe api----

Router.put ('/subscribe/:userBId',checkAuth,async(req,res)=>{
   try {
    const userA=await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;
    console.log((userA));
    const userB=await User.findById(req.params.userBId);
    console.log(userB);
    if(userB.subscribedBy.includes(userA._id)){
        return res.status(500).json({
            error:'Already Subscribed'
        })
        
    }
    //console.log('not subscribe');
    userB.subscribers +=1;
    userB.subscribedBy.push(userA._id)
    await userB.save()
    const userAFullInfo=await User.findById(userA._id)
    userAFullInfo.subscribedChannels.push(userB.id)
    await userAFullInfo.save();    


    res.status(200).json({
        msg:'Subscribed...'
    })

   } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
    })}



});

// --- UnSubscribe api----

Router.put('/unsubscribe/:userBId',checkAuth,async (req,res)=>{
    try {
    const userA=await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;
    const userB=await User.findById(req.params.userBId)
    // console.log(userA);
    // console.log(userB);

    if(userB.subscribedBy.includes(userA._id)){

        userB.subscribers -= 1;
        userB.subscribedBy=userB.subscribedBy.filter(userId=>userId.toString() != userA._id)
        await userB.save();

        const userAFUllInfoo=await User.findById(userA.id);
        userAFUllInfoo.subscribedChannels=userAFUllInfoo.subscribedChannels.filter(userId=>userId.toString() != userB._id)
        await userAFUllInfoo.save();

        res.status(200).json({
            msg:'Unsubscribed...'
        })
    }
    else
    {
        return res.status(500).json({
            error:'Not Subscribed...'
        })
    }
    
    } catch (err) {

    }
})

module.exports=Router;