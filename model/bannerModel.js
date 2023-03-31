const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    banner:{
        type:String,
        required:true
    },
    bannerImage:{
        type:Array,
        required:true
    },
    is_active:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('Banner',bannerSchema)