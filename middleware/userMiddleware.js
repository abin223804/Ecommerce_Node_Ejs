const session = require("express-session");

let userSession = false || {}
let isLoggedin;

const isLogin = async(req,res,next)=>{
    try {
        userSession = req.session
        if(userSession.userId){}
        else{
            res.redirect('/login')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async(req,res,next)=>{
    try {
        userSession = req.session
        if(userSession.userId){
            isLoggedin = true
            res.redirect('/userHome')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}