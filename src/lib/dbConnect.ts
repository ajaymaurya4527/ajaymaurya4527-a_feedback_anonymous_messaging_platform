import { promises } from "dns";
import mongoose from "mongoose";

type ConnectionObject={
    isConnected?:number
}

const connection:ConnectionObject={}

async function dbConnect():Promise<void>{
    if(connection.isConnected){//2. स्पीड बढ़ाना (Performance/Latency)  ///://बिना इस कंडीशन के: हर बार यूजर को इंतज़ार करना पड़ेगा क्योंकि कोड बार-बार नया कनेक्शन बनाएगा। // ://इस कंडीशन के साथ: अगर कनेक्शन पहले से मौजूद है, तो कोड उसका तुरंत इस्तेमाल कर लेगा। इसे "Connection Pooling" कहते हैं।
        console.log("Already connected to database")
        return
    }

    try {
        const db= await mongoose.connect(process.env.MONGODB_URI || "")

        connection.isConnected=db.connections[0].readyState

        console.log("DB connected successfully")
        
    } catch (error) {

        console.log("DB connection failed",error)

        process.exit(1)
        
    }

}

export default dbConnect;