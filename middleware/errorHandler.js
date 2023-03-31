// error handler 

const errorHandler = (error,req,res,next) => {
    if(error){
        res.status(500).json({
            error:{
                message:"oops something wrong",
            }
        })
        console.log(error);
    }
}

module.exports = errorHandler;