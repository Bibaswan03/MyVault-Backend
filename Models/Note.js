import mongoose from "mongoose"

const noteSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    }
    ,
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    time:{
        type:String,
        required:true,
    }
    
}, { timestamps: true })

const Note=mongoose.model("Note", noteSchema)
export default Note