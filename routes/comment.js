const express=require('express')
const Router=express.Router()
const Comment=require('../models/Comment');
const checkAuth = require('../middleware/checkAuth');
const jwt=require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const { router } = require('../app');

Router.post('/new-comment/:videoId',checkAuth,async(req,res)=>{
    try {
        const verifiedUser= await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;

        console.log(verifiedUser);
        const newComment=new Comment({
            _id:new mongoose.Types.ObjectId,
            videoId:req.params.videoId,
            userId:verifiedUser._id,
            commentText:req.body.commentText

        })
        const comment=await newComment.save()
        res.status(200).json({
            newComment:comment
        })
        

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })
        
        
    }
})
// get all comment for any video

Router.get('/:videoId',async(req,res)=>{
    try {
        
        const comments=await Comment.find({videoId:req.params.videoId}).populate('userId','channelName logoUrl')

        res.status(200).json({
            commentList:comments
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })
        
        
    }
});
//-----------update comment--------

Router.put('/:commentId',checkAuth,async(req,res)=>{

    try {
        const verifiedUser= await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;
        console.log(verifiedUser);

        const comment=await Comment.findById(req.params.commentId)
        console.log(comment);

        if(comment.userId != verifiedUser._id){
            return res.status(500).json({
                error:'invalid user'
            })
        }
        comment.commentText=req.body.commentText;
        const updateComment=await comment.save()
        res.status(200).json({
            updateComment:updateComment
        })
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })      
        
    }
    
})

//-----------Delete comment--------

Router.delete('/:commentId',checkAuth,async(req,res)=>{

    try {
        const verifiedUser= await jwt.verify(req.headers.authorization.split(" ")[1],'anilsethi2024') ;
        console.log(verifiedUser);

        const comment=await Comment.findById(req.params.commentId)
        console.log(comment);

        if(comment.userId != verifiedUser._id){
            return res.status(500).json({
                error:'invalid user'
            })
        }
        await Comment.findByIdAndDelete(req.params.commentId)
        res.status(200).json({
            deleteData:'Success...'
        })
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error:err
        })      
        
    }
    
})


module.exports=Router;
