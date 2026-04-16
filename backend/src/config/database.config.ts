import mongoose from "mongoose";
import {Env} from "./env.config";

const connectDatabse = async() =>{
    try{
        await mongoose.connect(Env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
        
});
console.log("Connected to Mongo databse");
    }
catch(error){
    console.error("Error connecting to MongoDB DAatabse", error);
    process.exit(1);
}
};

export default connectDatabse;