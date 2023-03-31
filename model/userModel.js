const mongoose = require("mongoose");
const Product = require('../model/productModel')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  mobile: {
    type: String,
    required: true, 
  },
  
  password: {
    type: String,
    required: true,
  },
  password2:{
    type:String}, 
  isAdmin: {
    type: Number,
    required:true

  },
  isVerified:{
    type:Number,
    default:0
  },
  cart: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        qty: {
          type: Number,
          required: true
        },
        price: {
          type: Number
        }
      }
    ],
    totalPrice: {
      type: Number,
      default: 0
    }
  },
  wishlist: {
    item: [{
      productId: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      price: {
        type: Number
      }
    }]
  }



});

userSchema.methods.addToWishlist = function (product) {
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => {
    return new String(objInItems.productId).trim() == new String(product._id).trim()
  })
  if (isExisting >= 0) {
  } else {
    wishlist.item.push({
      productId: product._id,
      price: product.price
    })
  }
  return this.save()
}


userSchema.methods.removefromWishlist = async function (productId) {
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
  if (isExisting >= 0) {
    await Product.findById(productId)
    wishlist.item.splice(isExisting, 1)
    return this.save()
  }
}



userSchema.methods.addToCart = function(product){
  const cart = this.cart
  const pros = product.quantity
  // console.log(pros);
  const isExisting = cart.item.findIndex((objInItems) =>{
      return  (
          new String(objInItems.productId).trim()== new String(product._id).trim()
      )
  })
  if(isExisting>=0){
      if(cart.item[isExisting].qty >= pros){
          cart.item[isExisting].qty += 0
          }else{
              cart.item[isExisting].qty += 1
          }
  }else{
      cart.item.push({productId:product._id, qty:1, price:product.price})
  }
  cart.totalPrice += product.price
  console.log('user in schema:',this);
  return this.save();

}
// userSchema.methods.addToCart = function (product) {
//   const cart = this.cart
//   const isExisting = cart.item.findIndex((objInItems) => {
//     return (
//       new String(objInItems.productId).trim() == new String(product._id).trim()
//     )
//   })
//   if (isExisting >= 0) {
//     cart.item[isExisting].qty += 1
//   } else {
//     cart.item.push({ productId: product._id, qty: 1, price: product.price })
//   }
//   cart.totalPrice += product.price
//   console.log('User in schema:', this)
//   return this.save()
// }








userSchema.methods.removefromCart=async function(productId){

const cart=this.cart
const isExisting=cart.item.findIndex(
  (objInItems)=>
  new String(objInItems.productId).trim()=== new String(productId).trim()

)
if(isExisting>=0){
  const prod=await Product.findById(productId)
  cart.totalPrice-= prod.price * cart.item[isExisting].qty
  cart.item.splice(isExisting,1)
  console.log('user in schema:',this);
  return this.save()

}}












module.exports = mongoose.model("User", userSchema);
