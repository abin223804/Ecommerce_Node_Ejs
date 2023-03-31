const register = require("../model/userModel");
const bcrypt = require("bcrypt");
const product = require("../model/productModel");
const category = require("../model/categoryModel");
const Order = require("../model/ordersModel");
const Banner = require("../model/bannerModel");
const Offer=require("../model/offerModel");
const Address = require("../model/addressModel");
const fast2sms = require("fast-two-sms");
const { findOne } = require("../model/userModel");
const userMiddleware = require("../middleware/userMiddleware");
const { ObjectID } = require("bson");
const { loadDashboard } = require("./adminController");
const { request } = require("express");
const Razorpay = require("razorpay");

let isLoggedin;
isLoggedin = false;
let userSession = false || {};

let newOtp;
let newUser;


let offer={
  name:"None",
  type:"None",
  discount:0,
  usedBy:false,
};
let couponTotal=0;
let nocoupon;

const loadstore = async (req, res,next) => {
  try {
    userSession = req.session;
    userSession.couponTotal=couponTotal;
    userSession.nocoupon=nocoupon;
    userSession.offer=offer;
    const banner=await Banner.findOne({is_active:1})
    const productData=await product.find();
    // console.log(banner);

    res.render("userHome", {
      isLoggedin: false,
      products:productData,

      id: userSession.userId,
      banners: banner,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadsignup = (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadlogin = (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const userAddress=(req,res)=>{
  try{
    res.render("userAddress")
  }catch(error){
        console.log(error.message);
        next(error);
  }
}



const verifylogin = async (req, res,next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await register.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.isVerified === 0) {
          res.render("login", {
            message:
              "your account has been devactivated please contact the Customer Care for more information",
          });
        } else {
          if (userData.isAdmin === 1) {
            res.render("login", { message: "Not user" });
          } else {
            userSession = req.session;
            userSession.userId = userData._id;
            isLoggedin = true;
            res.redirect("/");
            console.log("logged in");
          }
        }
      } else {
        res.render("login", {
          message: "email or password is incorrect",
        });
      }
    } else {
      res.render("login", { message: "email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const storesignup = async (req, res,next) => {
  try {
    console.log(req.body);
    const spassword = await securePassword(req.body.password);
    const user = new register({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: spassword,
      isAdmin: 0,
    });

    const userData = await user.save();
    newUser = userData._id;
    if (userData) {
      res.redirect("verifyOtp");
    } else {
      res.render("/signup", { message: "your registration was a failure" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const userLogout = async (req, res,next) => {
  userSession = req.session;
  userSession.userId = false;
  isLoggedin = false;
  console.log("Logged out");
  res.redirect("/");
};

const sendMessage = function (mobile, res) {
  let randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    authorization: process.env.API_KEY,
    message: `your OTP verification code is ${randomOTP}`,
    numbers: [mobile],
  };
  //send this message
  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("otp send successfully");
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
  return randomOTP;
};

const loadOtp = async (req, res,next) => {
  const userData = await register.findById({ _id: newUser });
  const otp = sendMessage(userData.mobile, res);
  newOtp = otp;
  mobile = userData.mobile;
  console.log("otp: ", otp);
  res.render("verifyOtp", { otp: otp, user: newUser, mobileNo: mobile });
};

const verifyOtp = async (req, res,next) => {
  try {
    const otp = newOtp;
    const userdata = await register.findById({ _id: req.body.user });
    if (otp == req.body.otp) {
      userdata.isVerified = 1;

      const user = await userdata.save();

      if (user) {
        res.redirect("/login");
      }
    } else {
      res.render("verifyOtp", { message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadProducts = async (req, res,next) => {
  try {
    userSession = req.session;
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 9;
    const productdata = await product
      .find({
        isAvailable: 1,
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
        ],
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await product
      .find({
        isAvailable: 1,
        $or: [
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
          { name: { $regex: ".*" + search + ".*", $options: "i" } },
        ],
      })
      .countDocuments();

    const categorydata = await category.find();
    const id = req.query.id;
    const data = await category.findOne({ _id: id });

    if (data) {
      const productdata = await product.find({ category: data.name });
      console.log(productdata);
      res.render("userProducts", {
        id: userSession.userId,
        products: productdata,
        cat: categorydata,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    } else {
      res.render("userProducts", {
        products: productdata,
        cat: categorydata,
        id: userSession.userId,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        previous: new Number(page) - 1,
        next: new Number(page) + 1,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const productDetails = async (req, res,next) => {
  try {
    userSession = req.session;
    const id = req.query.id;
    const products = await product.find();
    const productdata = await product.findById({ _id: id });
    if (productdata) {
      res.render("singleProduct", {
        isLoggedin,
        id: userSession.userId,
        product: productdata,
        products: products,
      });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
const dashboard = async (req, res,next) => {
  try {
    userSession = req.session;
    const userData = await register.findById({ _id: userSession.userId });
   
    const addressData = await Address.find({ userId: userSession.userId });
    
    console.log(addressData);
    res.render("userDashboard", {
      // isLoggedin,
      user: userData,
      userAddress: addressData,
     

      id: userSession.userId,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadOrder=async(req,res,next)=>{
try{
  const userSession=req.session;
  const orderData=await Order.find({userId:userSession.userId}).sort({createdAt:-1})
  res.render('userOrder',{Order:orderData,id:userSession.userId})
}catch(error){
  console.log(error.message);
  next(error);
}

}

const loadnewaddress = async (req, res,next) => {
  try {
    userSession = req.session;
    const userData = await register.findById({ _id: userSession.userId });
    const addressData = await Address.find({ userid: userSession.userId });

    res.render("usernewaddress", {
      user: userData,
      userAddress: addressData,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const addAddress = async (req, res,next) => {
  try {
    userSession = req.session;
    const addressData = Address({
      userId: userSession.userId,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      phone: req.body.phone,
    });
    await addressData.save();
    res.redirect("/loadNewAddress");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const deleteAddress = async (req, res,next) => {
  try {
    userSession = req.session;
    const id = req.query.id;

    await Address.deleteOne({ _id: id });
    res.redirect("/loadNewAddress")
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
const changePassword=async(req,res,next)=>{
try{
const userSession=req.session;
const name=req.body.name;
const number = req.body.umber;
const email=req.body.email;
const newPassword=req.body.Password1;
const secure_password=await securePassword(newPassword)
const updateData=await register.updateOne({id:userSession._id},{$set:{
name:name,
mobile:number,
email:email,
password:secure_password
}})
console.log(updateData);
if(updateData){
  res.redirect('/dashboard') 
}
}catch(error){
  console.log(error.message);
  next(error);
}












}





const AddToWishlist = async (req, res,next) => {
  try {
    const productId = req.query.id;
    console.log(productId);
    userSession = req.session;
    console.log(userSession.userId);

    const userData = await register.findById({ _id: userSession.userId });
    console.log(userData);
    const productData = await product.findById({ _id: productId });

    userData.addToWishlist(productData);
    console.log(productData);
    res.redirect("/products");
  } catch (error) {
    console.log(error.messsage);
    next(error);
  }
};

const loadWishlist = async (req, res,next) => {
  try {
    const userData = await register.findById({ _id: userSession.userId });
    const completeUser = await userData.populate("wishlist.item.productId");
    console.log(completeUser);

    if (userSession.userId) {
      res.render("wishlist", {
        isLoggedin,
        id: userSession.userId,
        wishlistProducts: completeUser.wishlist,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const deleteWishlist = async (req, res,next) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await register.findById({ _id: userSession.userId });
    await userData.removefromWishlist(productId);
    res.redirect("/wishlist");
  } catch (error) {
    
    console.log(error.message);
    next(error);
  }
};

const addToCart = async (req, res,next) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await register.findById({ _id: userSession.userId });
    const productData = await product.findById({ _id: productId });
    userData.addToCart(productData);

    {
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};










const loadCart = async (req, res,next) => {
  try {
    userSession = req.session;
    const userData = await register.findById({ _id: userSession.userId });
    const completeUser = await userData.populate("cart.item.productId");
    res.render("cart", {
      isLoggedin,
      id: userSession.userId,
      cartProducts: completeUser.cart,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const editCart = async (req, res,next) => {
  try {
  
    const id = req.query.id;

    userSession = req.session;
    const userData = await register.findById({ _id: userSession.userId });
    const foundProduct = userData.cart.item.findIndex(
      (objInItems) => objInItems.productId == id
    );
    const qty = {a: parseInt(req.body.qty)}
  
    userData.cart.item[foundProduct].qty = qty.a
    
    userData.cart.totalPrice = 0;
    const price =userData.cart.item[foundProduct].price
    const totalPrice = userData.cart.item.reduce((acc, curr) => {
      return acc + curr.price * curr.qty;
    }, 0);
    userData.cart.totalPrice = totalPrice;
    await userData.save();
    // res.redirect("/cart");
    res.json({totalPrice,price})
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};








const deleteCart = async (req, res,next) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await register.findById({ _id: userSession.userId });
    await userData.removefromCart(productId);
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const addToCartDeleteWishlist = async (req, res,next) => {
  try {
    userSession = req.session;
    const productId = req.query.id;
    const userData = await register.findById({ _id: userSession.userId });
    const productData = await product.findById({ _id: productId });
    const add = await userData.addToCart(productData);
    if (add) {
      await userData.removefromWishlist(productId);
    }
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};



// 


const checkout = async (req, res,next) => {
  try {
    userSession = req.session;
    const id = req.query.addressid;
    const userData = await register.findById({ _id: userSession.userId });
    const completeUser = await userData.populate("cart.item.productId");
    if (userSession.userId && completeUser.cart.totalPrice) {
      const addressData = await Address.find({ userId: userSession.userId });
      const selectAddress = await Address.findOne({ _id: id });
      const offer = await Offer.findOne({ _id: userSession.userId });
      

      if (userSession.couponTotal == 0) {
        //update coupon

        userSession.couponTotal = userData.cart.totalPrice;
      }

      res.render("checkout", {
        isLoggedin,
        id: userSession.userId,
        cartProducts: completeUser.cart,
        offer: userSession.offer,
        couponTotal: userSession.couponTotal,
        nocoupon,
        qty: completeUser.cart.item.qty,
        addSelect: selectAddress,
        userAddress: addressData,
      });

      nocoupon = false;
    } else {
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};












const storeOrder = async (req, res, next) => {
  try {
    userSession = req.session;

    // Check if required fields are missing
    if (!req.body.payment || !req.body.firstname || !req.body.lastname || !req.body.country || !req.body.address || !req.body.city || !req.body.state || !req.body.zip || !req.body.phone) {
      return res.render('alert');
    }

    if (userSession.userId) {

      // Rest of the code...
      if (userSession.userId) {
     
        const userData = await register.findById({ _id: userSession.userId });
        
        const completeUser = await userData.populate("cart.item.productId");
        console.log('2')
   
        userData.cart.totalPrice = userSession.couponTotal;
        const updatedTotal = await userData.save();
        console.log('1')
        if (completeUser.cart.totalPrice > 0) {
          const order = Order({
            userId: userSession.userId,
            payment: req.body.payment,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            country: req.body.country,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phone,
            products: completeUser.cart,
            offer: userSession.offer,
            discount: userSession.offer.discount,
          });
          console.log('3')
          const orderProductStatus = [];
          for (const key of order.products.item) {
            orderProductStatus.push(0);
          }
          Order.productReturned = orderProductStatus;
  
          const orderData = await order.save();
          // console.log(orderData)
          userSession.currentOrder = orderData._id;
  
          req.session.currentOrder = order._id;
  
          const ordern = await Order.findById({ _id: userSession.currentOrder });
          const productDetails = await product.find({ is_available: 1 });
          for (let i = 0; i < productDetails.length; i++) {
            for (let j = 0; j < ordern.products.item.length; j++) {
              if (
                productDetails[i]._id.equals(ordern.products.item[j].productId)
              ) {
                productDetails[i].sales += ordern.products.item[j].qty;
              }
            }
            productDetails[i].save();
          }
  
          const offerUpdate = await Offer.updateOne(
            { name: userSession.offer.name },
            { $push: { usedBy: userSession.userId } }
          );
  
          if (req.body.payment == "cod") {
            res.redirect("/orderSuccess");
          } else if (req.body.payment == "RazorPay") {
            res.render("razorpay", {
              isLoggedin,
              userId: userSession.userId,
              total: completeUser.cart.totalPrice,
            });
          } else {
            res.redirect("/checkout");
          }
        } else {
          res.redirect("/products");
        }
      }

    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};


















const loadSuccess = async (req, res,next) => {
  try {
    userSession = req.session;
    if (userSession.userId) {
      const userData = await register.findById({ _id: userSession.userId });
      const productData = await product.find();
      for (const key of userData.cart.item) {
        console.log(key.productId, " + ", key.qty);
        for (const prod of productData) {
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.quantity = prod.quantity - key.qty;
            await prod.save();
          }
        }
      }
      await Order.find({
        userId: userSession.userId,
      });
      await Order.updateOne(
        { userId: userSession.userId, _id: userSession.currentOrder },
        { $set: { status: "Build" } }
      );
      await register.updateOne(
        { _id: userSession.userId },
        {
          $set: {
            "cart.item": [],
            "cart.totalPrice": "0",
          },
        },
        { multi: true }
      );
      console.log("Order Built and Cart is Empty.");
    }
    userSession.couponTotal = 0;
    res.render("orderSuccess", {
      orderId: userSession.currentOrder,
      id: userSession.userId,
      isLoggedin,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};


const razorpayCheckout = async (req, res,next) => {
  userSession = req.session;
  const userData = await register.findById({ _id: userSession.userId });
  const completeUser = await userData.populate("cart.item.productId");
  var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
  });
  console.log(req.body);
  console.log(completeUser.cart.totalPrice);
  let order = await instance.orders.create({
    amount: completeUser.cart.totalPrice * 100,
    currency: "INR",
    receipt: "receipt#1",
  });
  res.status(201).json({
        success: true,
        order,
        
      });
    };
  











const cancelOrder = async (req, res,next) => {
  try {
    userSession = req.session;
    if (userSession.userId) {
      const id = req.query.id;
      await Order.deleteOne({ _id: id });
      res.redirect("/dashboard");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const orderDetails =  async (req,res,next)=>{
  try{
const userData = await register.findById({_id:req.session.userId})
    const order = await Order.findById({_id:req.query.id})
    console.log(order._id)
  
    const completeOrder = await order.populate('products.item.productId')
    

    
    res.render('orderDetails',{order:completeOrder,id:req.session.user_id,orders:order,orderId:order._id,user:userData})

  }
  catch(err)
  {
    console.log(err)
    next(error);
  }
}

const returnProduct=async(req,res,next)=>{
try{
  userSession=req.session;
  if((userSession=req.session)){
    const id=req.query.id;
    const productOrderData=await Order.findById({
      _id:ObjectID(userSession.currentOrder),
    })
    const productData=await product.findById({_id:id});
    if(productOrderData){
      for(let i=0; i<productOrderData.products.item.length;i++){
     if(new String(productOrderData.products.item[i].productId).trim()===
     new String(id).trim()
     ){
       productData.quantity+=productOrderData.products.item[i].qty;
       productOrderData.productReturned[i]=1;
       await productData.save().then(()=>{
        console.log("productdata saved successfully");
       });
       await Order.updateOne(
        {userId:userSession.userId,_id:userSession.currentOrder},
        {$set:{status:"Returned"}}
       );
       await productOrderData.save().then(()=>{
         console.log('productOrderdata saved');
         console.log(productOrderData);

       });
      }else{

      }
    }res.redirect("/dashboard");
  }
}else{
  res.redirect("/login");
}
}catch(error){
  console.log(error.message);
  next(error);
}}
     
  const addCoupon=async(req,res,next) =>{
try{
   userSession=req.session;
   if(userSession.userId){
    const userData=await register.findById({_id:userSession.userId});
    const offerData=await Offer.findOne({name:req.body.offer});
    if(offerData){
    if(offerData.usedBy.includes(userSession.userId)){
       nocoupon=true;
       res.redirect("/checkout");
    }else{
      userSession.offer.name=offerData.name;
      userSession.offer.type=offerData.type;
      userSession.offer.discount=offerData.discount;
let updatedTotal=userData.cart.totalPrice-
(userData.cart.totalPrice*userSession.offer.discount)/100;
userSession.couponTotal=updatedTotal;
res.redirect("/checkout");
}
}else{
  res.redirect("/checkout");
}
}
else{
  res.redirect("/loadCart");}
}catch(error){
  console.log(error.message);
  next(error);
}  };

 const returnRequest=async(req,res,next) =>{

try{
  const id=req.query.id
  await Order.findByIdAndUpdate({_id:id},{$set:{status:'rqstd'}})
  res.redirect("/dashboard")
}catch(error){
 console.log(error.message);
 next(error);
}

 } 





  
     
    



     

    
  








module.exports = {
  loadstore,
  verifylogin,
  loadlogin,
  loadsignup,
  storesignup,
  userLogout,
  sendMessage,
  loadOtp,
  verifyOtp,
  loadProducts,
  productDetails,
  userAddress,
  dashboard,
  loadWishlist,
  AddToWishlist,
  deleteWishlist,
  addToCart,
  loadCart,
  editCart,
  deleteCart,
  addToCartDeleteWishlist,
  checkout,
  loadnewaddress,
  addAddress,
  deleteAddress,
  changePassword,
  storeOrder,
  loadSuccess,
  razorpayCheckout,
  loadOrder,
  cancelOrder,
  orderDetails,
  returnProduct,
  addCoupon,
  returnRequest,
};
