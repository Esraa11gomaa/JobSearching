import userModel, { providerTypes, rolesTypes } from '../../../DB/model/User.model.js'
import { AsyncHandeler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { emailEvent } from './../../../utils/events/email.event.js';
import * as dbService from '../../../DB/dbService.js'
import { generateEncryption } from '../../../utils/security/encryption.js';
import { generateToken } from '../../../utils/security/token.js';
import { OAuth2Client } from 'google-auth-library';


export const signup = AsyncHandeler(
    async(req, res, next) => {
        
        const {firstname, lastname,email, password} = req.body

        if (await dbService.findOne({ model: userModel, filter:{email}})) {
            
            return next(new Error ("Email exist ", {cause: 409}))
        }

        const user = await dbService.create({
            model: userModel,
            data:{
                firstname, 
                lastname, 
                email,
                password : await generateHash({plainText:password})}
        })

        emailEvent.emit("sendConfirmEmail",{id: user._id ,email})
       
        return successResponse({res, message:"Done", status:201,data:{user}})
    }
)

export const signIn = AsyncHandeler(
    async(req, res, next) => {
        
        const {email, password} = req.body

        const user = await dbService.findOne({
            model:userModel,
            filter:{email}
        })

        if (!user) {
            return res.status(400).json({ message: "Invalid Account" });
        }

        if (user.provider !== "system") {
        
            return res.status(400).json({ message: "Please sign in using Google" });
        }

        if (!compareHash({plainText: password , hashValue:user.password})) {
            return next(new Error ("In-valid account", {cause: 404}))
        }
        
        const access_token = generateToken({
            payload:{id: user._id},
                    signature: user.role === rolesTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
                    expiresIn:"1h"
                })
        
        const refresh_token = generateToken({
            payload:{id: user._id},
                    signature: user.role === rolesTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
                    expiresIn:"7d"
                })

        return successResponse({res, message:"Done", status:201, data:{access_token, refresh_token}})
    }
)

export const confirmEmail = AsyncHandeler(
    async(req, res, next) => {
        const {email, code} = req.body
       
        const user = await dbService.findOne({
            model: userModel,
            filter:{ email}
        }) 
        if (!user) {
            return next(new Error ("In-valid Account", {cause: 404}))
        }
        if (user.confirmEmail) {
            return next(new Error ("Already verified", {cause: 409}))
        }

        if (!user.confirmEmailOtp || !user.confirmEmailOtpExpiry) {
            return res.status(400).json({ message: "OTP not found or already used" });
        }

        const currentTime = new Date()
        
        if (!user.confirmEmailOtpExpiry || currentTime > user.confirmEmailOtpExpiry) {
            return next(new Error("In-valid OTP or Expired", { cause: 400 }));
        }

        if (!compareHash({plainText:code , hashValue:user.confirmEmailOtp})) {
            return next(new Error ("In-valid code", {cause: 400}))
        }
        await dbService.updateOne({
            model: userModel,
            filter: {email},
            data:{confirmEmail:true , $unset: { confirmEmailOtp: 0, confirmEmailOtpExpiry: 0}}
        }) 

        return successResponse({res})
    }
)

export const signupWithGmail = AsyncHandeler(
    async(req, res, next) => {
        
        const {idToken} = req.body

        if(!idToken){
            return next(new Error("Missing idToken", { cause: 400 }))
        }

        const client = new OAuth2Client(process.env.CLIENT_ID);

        
        async function verify(){
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.CLIENT_ID
            })

            let payload;
            payload = ticket.getPayload()

            return payload
        }

        const payload = await verify()

        if (!payload.email_verified) {
            return next (new Error("In-valid Account", {cause: 400}))
        }

        let user = await dbService.findOne({
            model:userModel,
            filter:{
                email: payload.email
            }

        })

        if (!user) {
            user = await dbService.create({model: userModel,
                data:{
                    firstname:payload.given_name,
                    lastname:payload.family_name,
                    email: payload.email,
                    confirmEmail: payload.email_verified,
                    Profileimage: payload.picture,
                    provider: providerTypes.google}
            })
           
        }

        if (user.provider !== providerTypes.google) {
            return next(new Error ("In-valid provider", {cause: 400}))
        }
        
        const access_token = generateToken({
            payload:{id: user._id},
            signature:user.role === rolesTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
            expiresIn:"1h"
        })

        const refresh_token = generateToken({
            payload: {id: user._id},
            signature: user.role === rolesTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            expiresIn: "7d"
        })
        
        return successResponse({res , data:{access_token,refresh_token,user}})
    }
)