const express = require("express");
const adminRoute = express();
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/Admincontroller");
const multer = require("../util/multer");

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

adminRoute.get("/admin", adminController.loadAdminLogin);
adminRoute.get("/", adminController.loadAdminLogin);
adminRoute.get(
  "/dashboard",
  adminMiddleware.isLogin,
  adminController.loadDashboard
);
adminRoute.get(
  "/adminLogout",
  adminMiddleware.isLogin,
  adminController.adminLogout
);
adminRoute.get(
  "/admin/adminLogout",
  adminMiddleware.isLogin,
  adminController.adminLogout
);
adminRoute.get("/user", adminMiddleware.isLogin, adminController.loadAdminUser);
adminRoute.get(
  "/blockUser",
  adminMiddleware.isLogin,
  adminController.blockUser
);
adminRoute.get(
  "/adminProduct",
  adminMiddleware.isLogin,
  adminController.adminProduct
);
adminRoute.get(
  "/addProduct",
  adminMiddleware.isLogin,
  adminController.loadAddProduct
);
adminRoute.get(
  "/adminCategory",
  adminMiddleware.isLogin,
  adminController.loadCategory
);
adminRoute.get(
  "/listCategory",
  adminMiddleware.isLogin,
  adminController.listCategory
);
adminRoute.get(
  "/unlistCategory",
  adminMiddleware.isLogin,
  adminController.unlistCategory
);

adminRoute.get(
  "/editProduct",
  adminMiddleware.isLogin,
  adminController.loadEditProduct
);
adminRoute.get(
  "/unlistProduct",
  adminMiddleware.isLogin,
  adminController.unlistProduct
);
adminRoute.get(
  "/listProduct",
  adminMiddleware.isLogin,
  adminController.listProduct
);
adminRoute.get(
  "/adminCancelOrder",
  adminMiddleware.isLogin,
  adminController.cancelOrder
);
adminRoute.get(
  "/confirmOrder",
  adminMiddleware.isLogin,
  adminController.confirmOrder
);
adminRoute.get(
  "/adminDeliveredOrder",
  adminMiddleware.isLogin,
  adminController.adminDeliveredOrder
);
adminRoute.get('/returnOrder',adminMiddleware.isLogin,adminController.returnOrder)

adminRoute.get(
  "/orderReport",
  adminMiddleware.isLogin,
  adminController.adminViewOrder
);
adminRoute.get(
  "/adminOrderDetails",
  adminMiddleware.isLogin,
  adminController.adminOrderDetails
);
adminRoute.get('/stockReport',adminMiddleware.isLogin,adminController.stockReport)
adminRoute.get(
  "/stockReport",
  adminMiddleware.isLogin,
  adminController.stockReport
);
adminRoute.get("/offer", adminMiddleware.isLogin, adminController.loadOffer);
adminRoute.post("/offers", adminController.addOffer);
adminRoute.get(
  "/deleteOffer",
  adminMiddleware.isLogin,
  adminController.deleteOffer
);
adminRoute.post("/login", adminController.verifyAdminLogin);
adminRoute.post(
  "/addProduct",
  multer.upload.array("sImage"),
  adminController.addProduct
);
adminRoute.post(
  "/adminCategory",
  adminMiddleware.isLogin,
  adminController.addCategory
);

adminRoute.post(
  "/editProduct",
  multer.upload.array("sImage"),
  adminController.editProduct
);
adminRoute.get(
  "/loadBanner",
  adminMiddleware.isLogin,
  adminController.loadBanner
);
adminRoute.get(
  "/currentBanner",
  adminMiddleware.isLogin,
  adminController.activeBanner
);
adminRoute.post(
  "/loadBanner",
  multer.upload.array("bannerImage", 3),
  adminController.addBanner
);


adminRoute.get('/salesReport',adminMiddleware.isLogin,adminController.salesReport)
adminRoute.get('/loadfullSales',adminMiddleware.isLogin,adminController.loadfullSales)
adminRoute.get('/monthlySales',adminMiddleware.isLogin,adminController.monthlySales)
adminRoute.get('/datewiseReport',adminMiddleware.isLogin,adminController.datewiseReport)
adminRoute.get('/download',adminMiddleware.isLogin,adminController.adminDownload)
adminRoute.get('/orderdetails',adminMiddleware.isLogin,adminController.loadorderreport)

adminRoute.post("/editCategory",adminMiddleware.isLogin, adminController.editCategory);

module.exports = adminRoute;
