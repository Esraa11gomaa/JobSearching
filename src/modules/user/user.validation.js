import joi from 'joi'
import { generalFields } from './../../middleware/validation.middlware.js';

export const updatePassword = joi.object().keys({
   oldPassword: generalFields.password.required().messages({
      "string.min": "Old password must be at least 8 characters long",
      "any.required": "Old password is required"
  }),
  password:generalFields.password.required().messages({
   "string.min": "Old password must be at least 8 characters long",
   "any.required": "new password is required"}),
   confirmationPassword:generalFields.confirmationPassword.required()
}).required()

export const updateProfile = joi.object().keys(
  { 
   firstname: generalFields.firstname.optional(),
   lastname:generalFields.lastname.optional(),
   phone: generalFields.phone,
   DOB: generalFields.DOB,
   gender: generalFields.gender.valid("male", "female")
  }
).required()
