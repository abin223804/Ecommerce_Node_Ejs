


// let adminSession = false || {}

const isLogin = async(req,res,next)=>{
    try {
        adminSession = req.session
        if(adminSession.adminId){}
        else{
            res.redirect('/admin/')
        }
        next()

    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async(req,res,next)=>{
    try {
        adminSession = req.session
        if(adminSession.adminId){
            isAdminLoggedin = true
            res.redirect('/admin/')
        }
        next()

    } catch (error) {
        console.log(error.message);
    }
}

// const isLogin = async (req, res, next) => {
//     try {
//         if (req.session.loggedIn) {
//             next()
//         } else {
//             res.render('adminLogin')
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }

// const isLogout = async (req, res, next) => {
//     console.log('z')
//     console.log(req.session.loggedIn)
//     try {
//         if (req.session.loggedIn === false) {
//             console.log('x')
//             res.render('adminLogin')
//         } else {
//             console.log('y')
//             res.render('dashboard')
//         }
//         next()
//     } catch (error) {
//         console.log(error.message)
//     }
// }


module.exports = {
    isLogin,
    isLogout
}