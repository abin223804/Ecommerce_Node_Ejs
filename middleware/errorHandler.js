// error handler 

const errorHandler = (err,req,res,next) => {
    if(err){
        res.status(500).json({
            error:{
                message:"oops something wrong",
            }
        })
        console.log(err);
    }
}

module.exports = errorHandler;