const User = require("../model/userModel");
const Product = require("../model/productModel");
const Order = require("../model/ordersModel");
const Category = require("../model/categoryModel");
const Offer = require("../model/offerModel");
const Banner = require("../model/bannerModel");
const bcrypt = require("bcrypt");
const path = require("path");
const { log } = require("console");
const multer = require("multer");
const exceljs = require("exceljs");

let isAdminLoggedin;
isAdminLoggedin = false;
let adminSession = false || {};
let orderType = "all";

const loadAdminLogin = async (req, res,next) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const loadDashboard = async (req, res,next) => {
  try {
    adminSession = req.session;
    if (isAdminLoggedin) {
      const productData = await Product.find();
      const userData = await User.find({ isAdmin: 0 });
      const adminData = await User.findOne({ isAdmin: 1 });
      const categoryData = await Category.find();

      const categoryArray = [];
      const orderCount = [];
      for (let key of categoryData) {
        categoryArray.push(key.name);
        orderCount.push(0);
      }
      const completeorder = [];
      const orderData = await Order.find();
      for (let key of orderData) {
        const uppend = await key.populate("products.item.productId");
        completeorder.push(uppend);
      }

      const productName = [];
      const salesCount = [];
      const productNames = await Product.find();
      for (let key of productNames) {
        productName.push(key.name);
        salesCount.push(key.sales);
      }
      for (let i = 0; i < completeorder.length; i++) {
        for (let j = 0; j < completeorder[i].products.item.length; j++) {
          const cataData = completeorder[i].products.item[j].productId.category;
          const isExisting = categoryArray.findIndex((category) => {
            return category === cataData;
          });
          orderCount[isExisting]++;
        }
      }

      const showCount = await Order.find().count();
      const productCount = await Product.count();
      const usersCount = await User.count({ is_admin: 0 });
      const totalCategory = await Category.count({ isAvailable: 1 });

      console.log(categoryArray);
      console.log(orderCount);

      res.render("dashboard", {
        users: userData,
        admin: adminData,
        Product: productData,
        category: categoryArray,
        count: orderCount,
        pname: productName,
        pcount: salesCount,
        showCount,
        productCount,
        usersCount,
        totalCategory,
      });
    } else {
      res.redirect("/admin/adminLogin");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const verifyAdminLogin = async (req, res,next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await User.findOne({ email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      console.log(passwordMatch);
      if (passwordMatch) {
        if (adminData.isAdmin === 1) {
          adminSession = req.session;
          isAdminLoggedin = true;
          adminSession.adminId = adminData._id;
          res.redirect("/admin/dashboard");
          console.log("Admin logged in");
        } else {
          res.render("adminLogin", { message: "Please redirect to user page" });
        }
      } else {
        res.render("adminLogin", {
          message: "Email and password is incorrect.",
        });
      }
    } else {
      res.render("adminLogin", { message: "Email and password is incorrect." });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const adminLogout = async (req, res,next) => {
  adminSession = req.session;
  adminSession.adminId = false;
  isAdminLoggedin = false;
  console.log("Admin logged out");
  res.redirect("/admin");
};

const loadAdminUser = async (req, res,next) => {
  try {
    const userData = await User.find({ isAdmin: 0 });
    // const adminData = await User.findOne({is_admin:1})

    res.render("adminUser", { users: userData });
    console.log(userData);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
const blockUser = async (req, res,next) => {
  
  try {
    
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData.isVerified) {
     
      await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 0 } });
    } else {
      
      await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 1 } });
    }
    res.redirect("/admin/user");
  } catch (error){
    console.log(error.message);
    next(error);
  }
};

const adminProduct = async (req, res,next) => {
  try {
    const productData = await Product.find();
    const categoryData = await Category.find();
    res.render("adminProduct", {
      products: productData,
      category: categoryData,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const addProduct = async (req, res,next) => {
  try {
    const images = req.files;

    const product = Product({
      name: req.body.sName,
      category: req.body.sCategory,
      price: req.body.sPrice,
      description: req.body.sDescription,
      quantity: req.body.sQuantity,
      rating: req.body.sRating,
      image: images.map((x) => x.filename),
    });
    const productData = await product.save();
    const categoryData = await Category.find();
    if (productData) {
      res.render("addProduct", {
        category: categoryData,
        message: "registration successfull.",
      });
    } else {
      res.render("addProduct", {
        category: categoryData,
        message: "registration failed",
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
const loadAddProduct = async (req, res,next) => {
  const categoryData = await Category.find({ isAvailable: 1 });
  try {
    res.render("addProduct", { category: categoryData });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
const loadCategory = async (req, res,next) => {
  try {
    const categoryData = await Category.find();
    res.render("adminCategory", { category: categoryData });
  } catch (error) {
    console.log(message.error);
    next(error);
  }
};

const addCategory = async(req,res,next)=>{
  try {
      
      const namecategory=req.body.category
      const upper=namecategory.toUpperCase()
      const lower=namecategory.toLowerCase()
      const categorydata = await Category.find().sort({createdAt:-1})
      const categoryexist = await Category.findOne({name:lower,name:upper})
      
      if(categoryexist){
         return res.render('adminCategory',{message:'category already exist',category:categorydata})
      }else{
          const category = Category({name:req.body.category})
      await category.save();
      res.redirect('/admin/adminCategory')
      }
  } catch (error) {
      console.log(error.message);
      next(error);
  }
}

const loadEditProduct = async (req, res,next) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById({ _id: id });
    const categoryData = await Category.find({ isAvailable: 1 });

    if (productData) {
      res.render("editProduct", 
      {
        product: productData,
        category: categoryData,
      }
      );
    } else {
      res,
        redirect("/admin/adminProduct", { message: "product doesn't exist" });
    }
  } catch (error) {
    console.log(error).message;
    next(error);
  }
};
const editProduct = async (req, res,next) => {
  try {
    const id = req.body.id;
    const name = req.body.sName;
    const category = req.body.sCategory;
    const price = req.body.sPrice;
    const quantity = req.body.sQuantity;
    const rating = req.body.sRating;
    const description = req.body.sDescription;
    const files = req.files;
    const image = files.map((x) => x.filename);

    console.log(image);

    if (image.length == 0) {
      await Product.updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            name,
            category,
            description,
            price,
            quantity,
            rating,
          },
        }
      );
    } else {
      await Product.updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            name,
            category,
            price,
            description,
            quantity,
            rating,
            image,
          },
        }
      );
    }
    res.redirect("/admin/adminProduct");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
const unlistProduct = async (req, res,next) => {
  try {
    const id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { isAvailable: 0 } });
    res.redirect("/admin/adminProduct");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
const listProduct = async (req, res,next) => {
  try {
    const id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { isAvailable: 1 } });
    res.redirect("/admin/adminProduct");
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const listCategory=async (req, res,next) => {
  try{
    const id=req.query.id
    await Category.updateOne({_id:id}, {$set: { isAvailable:1}})
    res.redirect('adminCategory')
  }
catch(error){
  console.log(error.message);
  next(error);
}
}

const unlistCategory=async(req, res,next) => {
  try{
    const id=req.query.id
    await Category.updateOne({_id:id},{$set:{isAvailable:0}})
    res.redirect('adminCategory')
  }
  catch(error){
    console.log(error.message);
    next(error);
  }
}






const adminViewOrder=async(req,res,next)=>{
try{
const productData=await Product.find()
const userData=await User.find({isAdmin:0})
const orderData=await Order.find().sort({createdAt:-1})
console.log(orderData)
for(let key  of orderData){
  await key.populate('products.item.productId');
  await key.populate('userId');
}
if(orderType==undefined){
res.render('orderReport',{
  users:userData,
  products:prooductData,
  order:orderData,

});

}else{
  id=req.query.id;
  res.render('orderReport',{
   users:userData,
   product:productData,
   order:orderData,
   id:id,


  })
}
}catch(error){
  console.log(
    error.message)
    next(error);
  
} 










}






const cancelOrder = async(req, res,next) => {
try{
const id=req.query.id;
await Order.deleteOne ({_id:id});
res.redirect('/admin/orderReport');
}catch(error){

console.log(error.message);
next(error);
}}


const confirmOrder=async(req,res,next)=>{

try{const id=req.query.id; 
  await Order.updateOne({_id:id},{$set:{status:'confirmed'}});
  res.redirect('/admin/orderReport');
}catch(error){
  console.log(error.message);
  next(error);
}
}

const adminDeliveredOrder=async(req,res,next)=>{
try{
const id=req.query.id;
await Order.updateOne({_id:id},{$set:{status:'Delivered'}});
res.redirect('/admin/orderReport');
}catch(error){
  console.log(error.message);
  next(error);
}
}

const returnOrder=async(req,res,next)=>{
  try{
   const id=req.query.id;
    await Order.findByIdAndUpdate({_id:id},{$set:{status:'Returned'}})
    res.redirect('/admin/orderReport')
  }catch(error){
    console.log(error.message);
    next(error);
  }
}

const adminOrderDetails=async(req,res,next)=>{

try{
const id=req.query.id;
const userData=await User.find()
const orderData=await Order.findById({_id:id});
await orderData.populate('products.item.productId');
await orderData.populate('userId')
res.render('adminViewOrder',{
  order:orderData,users:userData
})

}catch(error){
  console.log(error.message);
  next(error);
}
}
const stockReport=async(req,res,next)=>{
try{
  const productData=await Product.find()
  res.render('stockReport',{
    product:productData,
    admin:true
  })
}catch(error){
     console.log(error.message);
     next(error);
}
}


const loadOffer=async(req,res,next)=>{
try{
  const offerData= await Offer.find()
  res.render('offer',{offer:offerData})

}catch(error){
  console.log(error.message);
  next(error);
}}

const addOffer = async (req, res, next) => {
  try {
    const existingOffer = await Offer.findOne({ name: req.body.name });

    if (existingOffer) {
      const error = new Error('An offer with this name already exists.');
      error.statusCode = 409; // Conflict
      return res.status(409).json({ message: error.message });
    }

    const offer = Offer({
      name: req.body.name,
      type: req.body.type,
      discount: req.body.discount,
      expirydate: req.body.expirydate,
      minimumpurchase: req.body.minimumpurchase,
      maximumpurchase: req.body.maximumpurchase
    });

    await offer.save();
    res.redirect('/admin/offer');
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};



const deleteOffer=async(req,res,next)=>{
try{

  const id=req.query.id;
  await Offer.deleteOne({_id:id})
  res.redirect('/admin/offer')
}catch(error){
  console.log(error.message);
  next(error);
}

}

const loadBanner=async(req,res,next)=>{
try{
  const bannerData=await Banner.find()
  res.render('banner',{
    banners:bannerData
  })
}catch(error){
  console.log(error.message);
  next(error);
}}

const activeBanner=async(req,res,next)=>{
try{
  const id=req.query.id;
  await Banner.findOneAndUpdate({is_active:1},{$set:{is_active:0}})
  await Banner.findByIdAndUpdate({_id:id},{$set:{is_active:1}})
  res.redirect('/admin/loadBanner')
}catch(error){
  console.log(error.message);
  next(error);
}}

const addBanner=async(req,res,next)=>{
  try{
    const newBanner=req.body.banner
    const a=req.files
    const banner=new Banner({
      banner:newBanner,
        banner:newBanner,
        bannerImage:a.map((x)=>x.filename)
      })
    const bannerData=await banner.save()
    if(bannerData){
      res.redirect('/admin/loadBanner')
    }
  }catch(error){
    console.log(error.message);
    next(error);
  }
}



const salesReport=async(req,res,next)=>{
  try{
    const productData=await Product.find()
    res.render('salesReport',{product:productData});
  }catch(error){
    console.log(error.message);
    next(error);
  }
}
const monthlySales = async(req,res,next)=>{
  try {
      const month = req.body.month;
      // const endate = req.body.Endingdate;
      const startofmonth = new Date(month);
      const endofmonth = new Date(month);
      console.log(startofmonth);
      endofmonth.setMonth(endofmonth.getMonth()+1);
      const sales = await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startofmonth,
                $lte: endofmonth,
              },
              status: 'Delivered', // Only count completed orders
            },
          },
          {
            $unwind: '$products.item',
          },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
                productId: '$products.item.productId',
              },
              quantity: { $sum: '$products.item.qty' },
              totalSales: { $sum: '$products.item.price' },
            },
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id.productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $project: {
              _id: 0,
              month: '$_id.month',
              year: '$_id.year',
              productId: '$_id.productId',
              name: '$product.name',
              category: '$product.category',
              quantity: 1,
              totalSales: 1,
            },
          },
        ])
      // console.log(sales);
      res.render('monthlySales',{sales:sales})
      
  } catch (error) {       
      console.log(error.message);
      next(error);
  }
}

const datewiseReport = async(req,res,next)=>{
  try {
      const startdate = new Date(req.body.Startingdate)
      const enddate = new Date(req.body.Endingdate)

      // console.log(startdate);

      // const orders = await Order.find({createdAt:{$gte:startdate}})
      // console.log(orders);
      const sales = await Order.aggregate([
          {
              $match:{
                  createdAt:{
                      $gte: startdate,
                      $lt: enddate
                  },
                  status:'Delivered',
              },
          },
          {
              $unwind:'$products.item',
          },
          {
              $group:{
                  _id:'$products.item.productId',
                  totalSales:{ $sum: '$products.item.price'},
                  quantity:{ $sum: '$products.item.qty'}
              },
          },
          {
              $lookup:{
                  from:'products',
                  localField:'_id',
                  foreignField:'_id',
                  as:'product'
              },
          },
          {
              $unwind:'$product',
          },
          {
              $project:{
                  _id:0,
                  name:'$product.name',
                  category:'$product.category',
                  price:'$product.price',
                  quantity:'$quantity',
                  sales:'$totalSales'
              },
          },
      ])
      // console.log(sales);
      res.render('datewisereport',{sales:sales});
  } catch (error) {
      console.log(error.message);
      next(error);
  }
}

const adminDownload= async(req,res,next)=>{
  try {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet("Stockreport")

      worksheet.columns = [
          { header:"Sl no.",key:"s_no" },
          { header:"Product",key:"name" },
          { header:"Category",key:"category" },
          { header:"Price",key:"price" },
          { header:"Quantity",key:"quantity" },
          { header:"Rating",key:"rating" },
          { header:"Sales",key:"sales" },
          { header:"isAvailable",key:"isAvailable" },
      ];

      let counter = 1;

      const productdata = await Product.find()

      productdata.forEach((product)=>{
          product.s_no = counter;
          worksheet.addRow(product)
          counter++;
      })

      worksheet.getRow(1).eachCell((cell)=>{
          cell.font = {bold:true}
      });

      res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      res.setHeader("Content-Disposition","attachment; filename=products.xlsx")   
      
      return workbook.xlsx.write(res).then(()=>{
          res.status(200)
      })

  } catch (error) {
      console.log(error.message);
      next(error);
  }
}


const loadfullSales = async(req,res,next)=>{
  try {
      res.render('ALLSales')
  } catch (error) {
      console.log(error.message)
      next(error);
  }
}

const loadorderreport = async(req,res,next)=>{
  try {
      const productdata = await Product.find();
      const userdata = await User.find({is_admin:0})
      const orderdata = await Order.find().sort({createdAt :-1})
      for(let key of orderdata){
          await key.populate('products.item.productId')
          await key.populate('userId')
      }
      if(orderType == undefined){
          res.render('orderreport',{
              users:userdata,
              product:productdata,
              order:orderdata
          })
      }else{
           id = req.query.id;
          res.render('orderreport',{
              users:userdata,
              product:productdata,
              order:orderdata,
              id:id,
          })
      }
  } catch (error) {
      console.log(error.message);
      next(error);
  }
}


const editCategory = async (req, res) => {
  try {
    const id = req.body.id
    console.log(id);
    const category = await Category.findOne({ _id: id })
    if (category) {
      const categoryData = await Category.updateOne({ _id: id }, { $set: { name: req.body.category } })

    }
  } catch (error) {
    console.log(error);
  }
}

















module.exports = {
  loadAdminLogin,
  loadDashboard,
  verifyAdminLogin,
  loadAdminUser,
  adminLogout,
  blockUser,
  adminProduct,
  addProduct,
  loadAddProduct,
  loadCategory,
  addCategory,
  listCategory,
  unlistCategory,
  
  loadEditProduct,
  editProduct,
  unlistProduct,
  listProduct,
  adminViewOrder,
  cancelOrder ,
  confirmOrder,
  adminDeliveredOrder,
  adminOrderDetails,
  stockReport,
  loadOffer,
  addOffer,
  deleteOffer,
  loadBanner,
  activeBanner,
  addBanner,
  returnOrder,
  

  salesReport,
  monthlySales ,
  datewiseReport,
  adminDownload,
  loadfullSales,
  loadorderreport ,
  editCategory,
  
  
};
