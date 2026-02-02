import mongoose from 'mongoose'

const connectDB = async ()=>{
    try{
        mongoose.connection.on('connected' , ()=> console.log('MongoDB connected'))
        await mongoose.connect(process.env.MONGO_URI as string)
    }catch(err){
        console.error('Error connecting to MongoDB',err)
    }
}

export default connectDB;