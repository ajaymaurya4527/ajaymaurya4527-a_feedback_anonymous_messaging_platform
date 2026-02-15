import mongoose,{Schema,Document} from "mongoose";

export interface Message extends Document{
    id(id: any): void;
    content:string,//smaller s in ts
    createdAt:Date
}

export const messageSchema:Schema<Message>=new Schema({
    content:{type:String,required:true},///bigger s in mongoose
    createdAt:{type:Date,required:true,default:Date.now}
    
})

export interface User extends Document{
    username:string,//smaller s in ts
    email:string,
    password:string,
    verifyCode:string,
    verifyCodeExpiry:Date,
    isVerified:boolean,
    isAcceptingMessage:boolean,
    messages:Message[]

}

const userSchema:Schema<User>=new Schema({
    username:{type:String,required:[true,"Username is required"],trim:true,unique:true},///bigger s in mongoose
    email:{type:String,required:[true,"Email is required"],unique:true,match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"please use a valid email address"]},
    password:{type:String,required:[true,"Password is required"]},
    verifyCode:{type:String,required:[true,"Verifycode is required"]},
    verifyCodeExpiry:{type:Date,required:[true,"Verifycode expiry is required"]},
    isVerified:{type:Boolean,default:false},
    isAcceptingMessage:{type:Boolean,default:true},
    messages:[messageSchema]
})

const UserModel=(mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User",userSchema)
export default UserModel;





