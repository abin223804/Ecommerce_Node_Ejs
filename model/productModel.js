const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true
  },
  image: {
    type: Array
  },
  sales: {
    type: Number,
    default:0,
  },
  isAvailable: {
    type: Number,
    default: 1
  }
})

module.exports = mongoose.model('Product', productSchema)
