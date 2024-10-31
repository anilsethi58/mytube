const express=require('express');
const Router=express.Router();
const mongoose=require ('mongoose');
const checkAuth=require('../middleware/checkAuth');
const jwt =require('jsonwebtoken');
const cloudinary=require('cloudinary').v2
const Video=require('../models/Video');



 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME ,
    api_key: process.env.API_KEY,  
    api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});
// -----video upload------------

Router.post('/upload',checkAuth,async(req,res)=>{
    try {

        const token =req.headers.authorization.split(" ")[1]
        const user=await jwt.verify(token,'anilsethi2024');
        // console.log(user);
        // console.log(req.body);
        // console.log(req.files.video);
        // console.log(req.files.thumbnail);

        ///--- upload video and thumbnail---///
        const uploadedVideo=await cloudinary.uploader.upload(req.files.video.tempFilePath,{
            resource_type:'video'
        });
        const uploadedThumbnail=await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath);
        // console.log(loadedVideo);
        // console.log(loadedThumbnail);
        const newVideo=new Video({
            _id:new mongoose.Types.ObjectId,
            titel:req.body.titel,
            description:req.body.description,
            user_id:user._id,
            videoUrl:uploadedVideo.secure_url,
            videoId:uploadedVideo.public_id,
            thumbnailUrl:uploadedThumbnail.secure_url,
            thumbnailId:uploadedThumbnail.public_id,
            catagory:req.body.catagory,
            tags:req.body.tags.split(','),
        })

        
        const newUploadedVdoData=await newVideo.save()
        res.status(200).json({
            newVideo : newUploadedVdoData
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

/// =---- update video detail-----=

Router.put('/:videoId',checkAuth,async(req,res)=>{
    try {
       const verifiedUser= await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;
       const video=  await Video.findById(req.params.videoId)
       if (video.user_id == verifiedUser._id){

        // console.log('you have permission');
        //update vdo details
        if (req.files){
            await cloudinary.uploader.destroy(video.thumbnailId)
            const updatedThumbnail=await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
            const updatedData={
                titel:req.body.titel,
                description:req.body.description,
                catagory:req.body.catagory,
                tags:req.body.tags.split(','),
                thumbnailUrl:updatedThumbnail.secure_url,
                thumbnailId:updatedThumbnail.public_id,
            }
            const updateVideoDetail=await Video.findByIdAndUpdate(req.params.videoId,updatedData,{new:true});
            res.status(200).json({
                updateVideo:updateVideoDetail
            })

        }else{
            const updatedData={
                titel:req.body.titel,
                description:req.body.description,
                catagory:req.body.catagory,
                tags:req.body.tags.split(','),
            }
            const updateVideoDetail=await Video.findByIdAndUpdate(req.params.videoId,updatedData,{new:true});
            res.status(200).json({
                updateVideo:updateVideoDetail
            })
        }
        

       }
       else{

        return res.status(500).json({
            error:'you have no permission'
        })
       }

          
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        });
        
    }
});

// ----- Delete Video-----

Router.delete('/:videoId',checkAuth,async (req,res)=>{
    try {
       const verifiedUser= await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;
       console.log(verifiedUser);
       const video=await Video.findById(req.params.videoId)
       
       if(video.user_id == verifiedUser._id){

        await cloudinary.uploader.destroy(video.videoId,{resource_type:'video'});
        await cloudinary.uploader.destroy(video.thumbnailId);
        const deletedResponse=await Video.findByIdAndDelete(req.params.videoId)
        res.status(200).json({
            deletedResponse:deletedResponse
        })

       }
       else{
        return res.status(500).json({
            error:'pehele dekh e kiska id hai aur tere aukat se bahar hai'
        })
       }
       

        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })
        
        
    }
});
//--------------like api ------------//

Router.put('/like/:videoId',checkAuth,async(req,res)=>{
    try {
        
        const verifiedUser= await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;
        console.log((verifiedUser));
        const video=await Video.findById(req.params.videoId);
        console.log(video);

        if(video.likedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error:'Already liked...'
            })
        }
        if(video.dislikedBy.includes(verifiedUser._id)){
            video.dislike -= 1;
            video.dislikedBy=video.dislikedBy.filter
            (userId=>userId.toString()!=verifiedUser._id)
        }
        video.likes +=1;
        video.likedBy.push(verifiedUser._id)
        await video.save();

        res.status(200).json({
            msg:'liked'
        })
        

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })
        
        
    }
})
//--------------Disliked api ------------//

Router.put('/dislike/:videoId',checkAuth,async(req,res)=>{
    try {
        
        const verifiedUser= await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;
        console.log((verifiedUser));
        const video=await Video.findById(req.params.videoId);
        console.log(video);

        if(video.dislikedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error:'Already disliked...'
            })
        }
        if(video.likedBy.includes(verifiedUser._id)){
            video.likes -= 1;
            video.likedBy=video.likedBy.filter
            (userId=>userId.toString()!=verifiedUser._id)
        }
        video.dislike +=1;
        video.dislikedBy.push(verifiedUser._id)
        await video.save();

        res.status(200).json({
            msg:'disliked'
        })
        

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })
        
        
    }
});

Router.put('/views/:videoId' , async(req,res)=>{
    try {
        const video=await Video.findById(req.params.videoId)
        console.log(video)
        video.views +=1;
        await video.save();
        res.status(200).json({
            msg:'ok'
        })
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })
        
        }
})



module.exports=Router;