const jwt=require ('jsonwebtoken');

module.exports= async(req,res,next)=>{
   try {

    const token =req.headers.authorization.split(" ")[1]
    
    await jwt.verify(token,'anilsethi2024');
    next();

   } catch (err) {
    console.log(err)
    return res.status(500).json({
        error:'Invalid token'
    })

   }
    
}