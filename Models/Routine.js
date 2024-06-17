// import mongoose from "mongoose"

// const routineSchema = new mongoose.Schema({
//     email:{
//         type:String,
//         required:true,
//     }
//     ,
//     sunday:{
//         type:[Object],
//     },
//     monday:{
//         type:[Object],
//     },
//     tuesday:{
//         type:[Object],
//     },
//     wednesday:{
//         type:[Object],
//     },
//     thursday:{
//         type:[Object],
//     },
//     friday:{
//         type:[Object],
//     },
//     saturday:{
//         type:[Object],
//     },
    
// }, { timestamps: true })

// const Routine=mongoose.model("Routine", routineSchema)
// export default Routine



import mongoose from "mongoose"

const TaskSchema = new mongoose.Schema({
    time: { type: String, required: true },
    task: { type: String, required: true }
});

const RoutineSchema = new mongoose.Schema({
    email: { type: String, required: true },
    day: { type: String, required: true },
    details: [TaskSchema]
});

// module.exports = mongoose.model('Routine', RoutineSchema);
const Routine=mongoose.model("Routine", RoutineSchema)
export default Routine