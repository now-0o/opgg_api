module.exports = (reqHandler)=>{
    return async(req, res, next)=>{ 
        try{
            await reqHandler(req,res)
        }catch(err){
            next(err);
        }
    }
}