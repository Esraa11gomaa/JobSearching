import mongoose, { Types,model,Schema } from "mongoose";

export const statusTypes={
    pending:"pending",
    accepted:"accepted",
    viewed:"viewed",
    inConsideration:"in Consideration",
    rejected:"rejected"
}
const applicationSchema = new Schema({
    jobId:{
        type:Types.ObjectId,
        ref:"Job",
        required: true
    },
    userId:{
        type:Types.ObjectId,
        ref:"User",
        required: true
    },
    userCV: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true }
    },
    newApplication:{
        type: String
    },
    newApplicationOtp: String,
    newApplicationOtpExpiry: {  
        type: Date
    },
    updateApplication:{
        type: String
    },
    updateApplicationOtp: String,
    updateApplicationOtpExpiry: {  
        type: Date
    },
    status:{
        type:String,
        enum:Object.values(statusTypes),
        default:statusTypes.pending
    }

},{timestamps:true})

export const applicationModel = mongoose.model.Application || model(`Application`, applicationSchema)

export default applicationModel