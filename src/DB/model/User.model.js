import mongoose, { Schema, model , Types } from "mongoose"
import { generateHash } from './../../utils/security/hash.security.js';
import { generateDecryption } from "../../utils/security/encryption.js";

export const genderTypes = {
    male:'male',
    female: 'female'
}
export const rolesTypes = {
    user:'user',
    admin:'admin',
    owner:'owner',
    Hr:"HR"
}

export const providerTypes = {
    google:"google",
    System:"system"
}
const userSchema = new Schema({

    firstname:{
        type:String,
        required: true
    },
    lastname:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    confirmEmailOtp: String,
    confirmEmailOtpExpiry: {  
        type: Date
    },
    password:{
        type: String,
        required: (data)=>{
            return data?.provider === providerTypes.google ? false : true
        }
    },
    resetPassword: String, 
    resetPasswordOtp: String,
    resetOtpPasswordExpiry:{
        type:  Date
    },
    phone:String,
    address:String,
    DOB:Date,
    profileImage: {
        secure_url:String,
        public_id:String
    },
    coverImages:[ {
        secure_url:String,
        public_id:String
    }],
    gender:{
        type:String,
        enum:Object.values(genderTypes),
        default: genderTypes.male
    },
    roles:{
        type:String,
        enum:Object.values(rolesTypes),
        default: rolesTypes.user || rolesTypes.admin
    },
    confirmEmail:{
        type: Boolean,
        default:false
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    deletedAt:{
        type:Date,
        default:null
    },
    bannedAt:{
        type:Date,
        default:null
    },
    updatedBy:{
        type: Types.ObjectId,
        ref:"User"
    },
    changeCridentialsTime: {
        type:Date,
        default:Date.now
    },
    provider:{
        type:String,
        enum:Object.values(providerTypes),
        default: providerTypes.System
    },
},{
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
})

userSchema.virtual("username").get(function(){
    return`${this.firstname} ${this.lastname}`
})

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next()
    this.password = await generateHash({plainText: this.password})
    next()
})

userSchema.methods.getMobileNumber = function(){
    return generateDecryption({cipherText: this.phone})
}
const userModel = mongoose.model.User || model(`User`, userSchema)

export default userModel
