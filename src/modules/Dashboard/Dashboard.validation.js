import joi from 'joi'
import { generalFields } from '../../middleware/validation.middlware.js'

export const banOrUnbanUser = joi.object().keys({
    userId:generalFields.id
}).required()

export const approveCompany = joi.object().keys({
    companyId: generalFields.id.required()
}).required()