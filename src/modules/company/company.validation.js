import joi from "joi";
import { generalFields } from '../../middleware/validation.middlware.js'

export const addCompanyValidation = joi.object({
    companyName: generalFields.companyName.required(),
    companyEmail: generalFields.email.required(),
    description: generalFields.description.required(),
    industry:generalFields.industry.required(),
    address: generalFields.address.required(),
    numberOfEmployees: generalFields.numberOfEmployees.required()
});

export const updateCompany = joi.object({
    companyId: generalFields.id,
    companyName: generalFields.companyName,
    description: generalFields.description,
    industry: generalFields.industry,
    address: generalFields.address,
    numberOfEmployees: generalFields.numberOfEmployees,
    companyEmail: generalFields.email,
    createdBy: generalFields.createdBy,
    logo: generalFields.logo,
    coverImages: generalFields.coverImages,
    HRs: generalFields.HRs,
    deletedAt: generalFields.deletedAt,
    bannedAt: generalFields.deletedAt,
    isApproved: generalFields.isApproved
})

export const getCompany = joi.object({
    companyId: generalFields.id.required()
});

export const searchCompany = joi.object({
    companyName: generalFields.companyName.required()
});

export const uploadCompanyLogo = joi.object({
    companyId: generalFields.id.required()
});
