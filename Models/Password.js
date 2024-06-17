import mongoose from "mongoose"

const passwordSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    }
    ,
    domain:{
        type:String,
    },
    username:{
        type:String,
    },
    password:{
        type:String,
    },
    additional_details:{
        type:String,
    },
    
    
}, { timestamps: true })

const Password=mongoose.model("Password", passwordSchema)
export default Password