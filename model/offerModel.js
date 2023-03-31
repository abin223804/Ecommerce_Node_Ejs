const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        uppercase:true
    },
    type:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    expirydate:{
        type:Date,
        required:true
    },
    maximumpurchase:{
        type:Number,
        required:true
    },
    minimumpurchase:{
        type:Number,
        required:true
    },

    usedBy:[{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }]
})

module.exports = mongoose.model('Offer',offerSchema)