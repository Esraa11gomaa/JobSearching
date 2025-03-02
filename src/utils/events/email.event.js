import { EventEmitter } from "node:events";
import { customAlphabet } from "nanoid";
import { generateHash } from "../security/hash.security.js";
import userModel  from './../../DB/model/User.model.js';
import { sendEmail } from './../email/send.email.js';
import { verifyAccountTemplate } from "../email/template/verifyAccount.template.js";
import * as dbService from '../../DB/dbService.js'

export const emailEvent = new  EventEmitter()

export const emailSubject = {
    confirmEmail: "Confirma-Email",
    resetPassword: "Reset-Password"
}

export const sendCode = async ({data ={}, subject= emailSubject.confirmEmail } = {}) =>{

    const { id, email}= data
    const otp = customAlphabet("0123456789", 6)()

    const hashOTP = await generateHash({plainText:otp})
    
    const otpExpiry = new Date()
    otpExpiry.setHours(otpExpiry.getHours() + 6)
    let updateData = {}

    switch (subject) {
        case emailSubject.confirmEmail:
            updateData = { 
                confirmEmailOtp: hashOTP, 
                confirmEmailOtpExpiry: otpExpiry
            }
            break;
        case emailSubject.resetPassword:
            updateData = {
                resetPasswordOtp: hashOTP,
                resetOtpPasswordExpiry:otpExpiry
                
            }
            break;
        case emailSubject.newApplication:
            updateData = {
                newApplicationOtp: hashOTP,
                newApplicationOtpExpiry:otpExpiry
            }
            break;
        case emailSubject.updateApplication:
            updateData = {
                updateApplicationOtp: hashOTP,
                updateApplicationOtpExpiry:otpExpiry
            }
            break;
            
        default:
            break;            
    }
    
    
    await dbService.updateOne({model:userModel, filter:{_id : id}, data: updateData})
    
    const html = verifyAccountTemplate({code:otp})

    await sendEmail({to:email, subject, html })
}


emailEvent.on("sendConfirmEmail", async (data)=>{
    await sendCode({data})
})

emailEvent.on("forgetPassword", async (data)=>{

    await sendCode({ data, subject: emailSubject.resetPassword});
    
})






