
const mongoose=require ("mongoose")

const DB = process.env.DBURL;
mongoose.set('strictQuery',true);

const connect=()=>{

    mongoose.connect(DB, () => {
        console.log("Database is connected");
      });
      
}

module.exports={connect}