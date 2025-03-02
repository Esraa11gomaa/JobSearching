import joi from 'joi'
import { generalFields } from '../../middleware/validation.middlware.js'

export const application = joi.object({
    jobId: generalFields.id.required(),
    userCV: generalFields.userCV.required()
 })
 
 export const updateApplicationStatus = joi.object({
    applicationId: generalFields.id.required(),
    status:generalFields.status.required()
 })

export const exportApplicationsToExcel = joi.object({
   companyId: generalFields.id.required(),
   data: generalFields.data
}).required