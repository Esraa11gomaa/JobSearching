import mongoose, { model,Schema, Types } from "mongoose";

const companySchema = new Schema({
    companyName: {
        type: String,
        unique: true,
        required:true
    },
    description:{
        type: String,
        required: true
    },
    industry:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    numberOfEmployees:{
        type: String,
        required: true
    },
    companyEmail:{
        type: String,
        required: true,
        unique: true
    },
    createdBy:{
        type:Types.ObjectId,
        ref:"User",
        required: true
    },
    logo:{
        secure_url:String,
        public_id:String
    },
    coverImages:[ {
        secure_url:String,
        public_id:String
    }],
    HRs:[{
        type:Types.ObjectId,
        ref:"User"
    }],
    deletedAt:{
        type:Date,
        default:null
    },
    bannedAt:{
        type:Date,
        default:null
    },
    legalAttachment:{
        secure_url:String,
        public_id:String
    },
    isApproved:{
        type:Boolean,
        default:false
    }

},{
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
})

companySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "companyId"
})

const companyModel = mongoose.model.Company || model(`Comapny`,
    companySchema
)


export default companyModel