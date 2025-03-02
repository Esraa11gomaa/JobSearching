import joi from 'joi'
import { Types } from 'mongoose';
import { genderTypes } from '../DB/model/User.model.js';
import { jobLocationTypes, seniorityLevelTypes, WorkTimeTypes } from '../DB/model/Job.model.js';
import { statusTypes } from '../DB/model/Application.model.js';

export const isValidObjectId = (value, helper)=>{
    return Types.ObjectId.isValid(value) ? true : helper.message("In-valid object id")
}

export const generalFields = {

    firstname:joi.string().min(2).max(10).trim().required(),
    lastname:joi.string().min(2).max(10).trim().required(),
    email: joi.string().email({minDomainSegments:2 , maxDomainSegments:3, tlds:{allow:['com', 'net', 'outlook']}}),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[A-Z])(?=.*[#&<>@\"~;$^%{}?])(?=.*[a-zA-Z]).{8,}$/)),
    phone:joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    id: joi.string().custom(isValidObjectId),
    confirmationPassword:joi.string(),
    code:joi.string().pattern(new RegExp(/^\d{6}$/)),
    DOB: joi.date(),
    gender:joi.string().valid(...Object.values(genderTypes)),
    companyName: joi.string().min(2).max(100).trim(),
    description: joi.string().min(10).max(1000),
    industry: joi.string().min(2).max(50),
    address: joi.string().min(5).max(1000),
    numberOfEmployees: joi.string().min(1).max(100),
    createdBy: joi.string().custom(isValidObjectId),
    logo: joi.object({
        secure_url: joi.string().uri(),
        public_id: joi.string(),
    }).optional(),

    coverImages: joi.array().items(
        joi.object({
            secure_url: joi.string().uri(),
            public_id: joi.string(),
        })
    ).optional(),

    HRs: joi.array().items(joi.string().custom(isValidObjectId)).optional(),

    deletedAt: joi.date().allow(null),
    bannedAt: joi.date().allow(null),

    legalAttachment: joi.object({
        secure_url: joi.string().uri(),
        public_id: joi.string(),
    }).optional(),

    isApproved: joi.boolean().default(false),
    jobTitle: joi.string().min(2).max(100).trim().required(),
    jobLocation: joi.string().valid(...Object.values(jobLocationTypes)).default(jobLocationTypes.onsite).required(),
    workTime: joi.string().valid(...Object.values(WorkTimeTypes)).default(WorkTimeTypes.fullTime).required(),
    seniorityLevel: joi.string().valid(...Object.values(seniorityLevelTypes)).default(seniorityLevelTypes.senior).required(),
    jobDescription: joi.string().min(10).max(2000).trim().required(),
    technicalSkill: joi.array().items(joi.string().min(1).max(50)).required(),
    softSkills: joi.array().items(joi.string().min(1).max(50)).required(),
    addedBy: joi.string().custom(isValidObjectId).required(),
    updatedBy: joi.string().custom(isValidObjectId).optional(),
    closed: joi.boolean().default(false),
    userCV: joi.object({
        secure_url: joi.string().uri().required(),
        public_id: joi.string().required()
    }),
    data: joi.object({
        secure_url: joi.string().uri().required(),
        public_id: joi.string().required()
    }),
    status: joi.string().valid(...Object.values(statusTypes))
}
export const validation = (Schema)=>{
return (req, res , next)=>{
    const inputs ={...req.query, ...req.body, ...req.params }

    const validationResult = Schema.validate(inputs ,{ abortEarly: false })

    if (validationResult.error) {
        return res.status(400).json({message:"validation error" , details: validationResult.error.details})
    }

    return next()
}
}