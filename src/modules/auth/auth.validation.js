import joi from 'joi'
import { generalFields } from './../../middleware/validation.middlware.js';


export const signup = joi.object().keys({
    firstname:generalFields.firstname.required(),
    lastname:generalFields.lastname.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword:generalFields.confirmationPassword.valid(joi.ref("password")).required(),
}).required()

export const signIn = joi.object().keys({
    email: generalFields.email.required(),
    password: generalFields.password.required()
}).required()

export const login = joi.object().keys({
    email: generalFields.email.required(),
    password: generalFields.password.required()
}).required()

export const confirmEmail = joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required()
}).required()


export const forgetPassword = joi.object().keys({
    email: generalFields.email.required()
})

export const resetPassword = joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.valid(joi.ref('password')).required()
})

