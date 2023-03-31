const express = require("express");

const userRoute = express();
const user = require("../model/userModel");
const userController = require("../controllers/usercontroller");
const userMiddleware = require('../middleware/userMiddleware')


userRoute.set("views", "./views/user");

userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.get("/", userController.loadstore);
userRoute.get("/userHome", userController.loadstore);

userRoute.get("/signup", userController.loadsignup);
userRoute.post("/signup", userController.storesignup);
userRoute.get("/verifyOtp", userController.loadOtp);
userRoute.post("/verifyOtp", userController.verifyOtp);

userRoute.get("/login",userMiddleware.isLogout, userController.loadlogin);
userRoute.post("/login", userController.verifylogin);

userRoute.get("/logout",userMiddleware.isLogin, userController.userLogout);
userRoute.get("/products",userController.loadProducts);
userRoute.get('/productDetails',userController.productDetails);
userRoute.get('/dashboard',userMiddleware.isLogin,userController.dashboard)
userRoute.get('/loadOrders',userMiddleware.isLogin,userController.loadOrder)
userRoute.get('/loadNewAddress',userMiddleware.isLogin,userController.loadnewaddress)

userRoute.post('/addAddress',userMiddleware.isLogin,userController.addAddress)
userRoute.post('/changePassword',userMiddleware.isLogin,userController.changePassword)
userRoute.get('/deleteAddress',userMiddleware.isLogin,userController.deleteAddress)
userRoute.get('/addToWishlist',userMiddleware.isLogin,userController.AddToWishlist)
userRoute.get('/wishlist',userMiddleware.isLogin,userController.loadWishlist)
userRoute.get('/deleteWishlist',userController.deleteWishlist)
userRoute.get('/cart',userMiddleware.isLogin,userController.loadCart)
userRoute.get('/addToCart',userMiddleware.isLogin,userController.addToCart)
userRoute.post('/editCart',userController.editCart);
userRoute.get('/deleteCart',userController.deleteCart)
userRoute.get('/addToCartDeleteWishlist',userController.addToCartDeleteWishlist)
userRoute.post('/addCoupon',userMiddleware.isLogin,userController.addCoupon)
userRoute.get('/checkout',userController.checkout)
userRoute.post('/checkout',userController.storeOrder)
userRoute.post('/razorpay',userController.razorpayCheckout)


userRoute.get('/ordersuccess',userMiddleware.isLogin,userController.loadSuccess)
userRoute.get('/cancelOrder',userMiddleware.isLogin,userController.cancelOrder)
userRoute.get('/orderDetails',userMiddleware.isLogin,userController.orderDetails)
userRoute.get('/returnProduct',userMiddleware.isLogin,userController.returnProduct)
userRoute.get('/returnOrder',userMiddleware.isLogin,userController.returnRequest)





module.exports = userRoute;
