import joi from 'joi'
import { generalFields } from '../../middleware/validation.middlware.js';

export const addJob = joi.object().keys({
   jobTitle: generalFields.jobTitle,
   jobLocation: generalFields.jobLocation,
   workTime: generalFields.workTime,
   seniorityLevel: generalFields.seniorityLevel,
   jobDescription: generalFields.jobDescription,
   technicalSkill: generalFields.technicalSkill,
   softSkills: generalFields.softSkills,
   addedBy: generalFields.id.required().messages({
      "any.required": "Job must be created by a company HR or company owner"
   })
}).required();

export const updateJob = joi.object().keys({
   jobId: generalFields.id.required().messages({
      "any.required": "Job ID is required"
   }),
   jobTitle: generalFields.jobTitle.optional(),
   jobLocation: generalFields.jobLocation.optional(),
   workTime: generalFields.workTime.optional(),
   seniorityLevel: generalFields.seniorityLevel.optional(),
   jobDescription: generalFields.jobDescription.optional(),
   technicalSkill: generalFields.technicalSkill.optional(),
   softSkills: generalFields.softSkills.optional(),
   updatedBy: generalFields.id.required().messages({
      "any.required": "Only the job owner can update this job"
   })
}).required();

export const deleteJob = joi.object().keys({
   jobId: generalFields.id.required().messages({
      "any.required": "Job ID is required"
   }),
   companyId: generalFields.id.required().messages({
      "any.required": "Company ID is required"
   }),
   deletedBy: generalFields.id.required().messages({
      "any.required": "Only a company HR related to the job company can delete this job"
   })
}).required();

export const getAllJobsForCompany = joi.object().keys({
   companyId: generalFields.id.required()
}).required()

export const jobIdValidation = joi.object({
   jobId: generalFields.id.required()
})

export const getAllJobsMatchingFilters = joi.object({
   workTime: generalFields.workTime.required(),
   jobLocation: generalFields.jobLocation,
   seniorityLevel: generalFields.seniorityLevel,
   jobTitle: generalFields.jobTitle,
   technicalSkill: generalFields.technicalSkill
})

