import mongoose from "mongoose";
import dotenv from 'dotenv'

const env = dotenv.config().parsed

const connection = () => {
    //Connect to monodb using mongoose
    mongoose.connect(env.MONGODB_URI,{
        dbname: env.MONGODB_NAME
    })

    const conn = mongoose.connection
    conn.on('error', console.error.bind(console, 'Connection Error: '))
    conn.once('open', () => {
        console.log(`Connected to Mongodb, database name : ${env.MONGODB_NAME}`)
    })
}

export default connection

