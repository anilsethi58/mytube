const http =require("http");
const app=require("../api/app")

const server=http.createServer(app)

server.listen(3000,()=>{
    console.log("----- App is running on port 3000 ------");
    
})