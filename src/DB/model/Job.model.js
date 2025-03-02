import mongoose, {Types,Schema, model } from "mongoose";

export const jobLocationTypes ={
    onsite:"onsite",
    remotly:"remotly",
    hybrid:"hybrid"
}

export const seniorityLevelTypes={
    fresh:"fresh",
    junior:"junior",
    mid_level:"mid-level",
    senior:"senior",
    TeamLeader:"Team Leader",
    CTO:"CTO"
}

export const WorkTimeTypes = {
    partTime:"part-time",
    fullTime:"full-time"
}

const jobSchema =  new Schema({

    jobTitle:{
        type:String,
        require: true
    },
    jobLocation:{
        type:String,
        enum:Object.values(jobLocationTypes),default:jobLocationTypes.onsite,
        require: true
    },
    workTime:{
        type: String,
        enum: Object.values(WorkTimeTypes),
        default:WorkTimeTypes.fullTime,
        required:true
    },
    seniorityLevel:{
        type: String,
        enum: Object.values(seniorityLevelTypes),
        default:seniorityLevelTypes.senior,
        required:true
    },
    jobDescription:{
        type:String,
        required:true
    },
    technicalSkill:[{
        type:String,
        required:true
    }],
    softSkills:[{
        type:String,
        required:true
    }],
    addedBy:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    updatedBy:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    closed:{
        type:Boolean,
        default:false
    },
    companyId:{
        type:Types.ObjectId,
        ref:"Company",
        required:true
    }
},{
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
})

jobSchema.virtual('applications', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'jobId',
});


export const jobModel = mongoose.model.Job || model(`Job`,
    jobSchema
)

export default jobModel