import { OAuth2Client } from 'google-auth-library';
import userModel, { providerTypes, rolesTypes } from '../../../DB/model/User.model.js'
import { AsyncHandeler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { decodedToken, generateToken, tokenTypes} from '../../../utils/security/token.js';
import { emailEvent } from './../../../utils/events/email.event.js';
import * as dbService from '../../../DB/dbService.js'


export const login = AsyncHandeler(
    async(req, res, next) => {
        const {email, password} = req.body
       
        const user = await 
        dbService.findOne({
            model:userModel,
            filter:{email, provider: providerTypes.System},
            projection: { roles: 1, email: 1, password: 1, confirmEmail: 1 } // ✅ Add "roles"
 
        })

        if (!user) {
            return next(new Error ("In-valid Account", {cause: 404}))
        }

        if (!user.confirmEmail) {
            return next(new Error ("please verify your account first", {cause: 400}))
        }
        
        const currentTime = new Date()
        
        if (currentTime > new Date(user.resetTokenExpiry)) {
            return next(new Error ("OTP Expired" , {cause: 400}))
        }

        if (!compareHash({plainText: password , hashValue:user.password})) {
            return next(new Error ("In-valid account", {cause: 404}))
        }
        
        console.log("✅ User Role from DB:", user.role); // Debugging line

        const access_token = generateToken({
            payload:{id: user._id},

            userRole:user.role
            // signature: user.role === rolesTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
        })

        const refresh_token = generateToken({
            payload:{id: user._id},
            // signature: user.role === rolesTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
            userRole:user.role
            ,
            expiresIn:31536000
        })

        return successResponse({res , data:{token: {access_token, refresh_token}}})
    }
)

export const loginWithGmail = AsyncHandeler(
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
                data:{username:payload.name,
                    email: payload.email,
                    confirmEmail: payload.email_verified,
                    image: payload.picture,
                    provider: providerTypes.google}
            })
           
        }

        if (user.provider !== providerTypes.google) {
            return next(new Error ("In-valid provider", {cause: 400}))
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

        return successResponse({res , data:{
            token:{ access_token , refresh_token}
        }})
    }
)

export const refreshToken = AsyncHandeler(
    async (req, res, next) => {
        const {authorization} = req.headers

        const user = await  decodedToken({authorization, tokenType: tokenTypes.refresh , next})

        const userData = await dbService.findOne({
            model:userModel,
            filter:{_id: user._id}
        })
        if (!userData) {
            return next (new Error ("Account is Not Authorized", {cause: 404}))
        }

        if (userData.changeCridentialsTime && user.iat * 1000 < userData.changeCridentialsTime.getTime()) {
            
            return next(new Error("Refresh token is no longer valid. Please log in again.", { cause: 401 }));
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

        return successResponse({res , data:{token: {access_token, refresh_token}}})

    }
)

export const forgetPassword = AsyncHandeler(
    async (req, res, next) => {
        
        const {email} = req.body
        const user = await dbService.findOne({
            model: userModel,
            filter: {email, isDeleted: false}
        }) 
        if(!user){
            return next(new Error("In-valid account", {cause: 404}))
        }

        if(!user.confirmEmail){
            return next(new Error("verify your account first", {cause: 400}))
        }

        
        emailEvent.emit("forgetPassword", {id: user._id , email})

        return successResponse({res,  message: "OTP sent to your email" })

    }
)

export const resetPassword = AsyncHandeler(
    async (req, res, next) => {
        
        const {email ,code, password} = req.body

        const user = await dbService.findOne({
            model: userModel,
            filter:{
                email, isDeleted: false
            }
        }) 

        if(!user){
            return next(new Error("In-valid account", {cause: 404}))
        }


        const currentTime = new Date();
        if (!user.resetOtpPasswordExpiry || currentTime > user.resetOtpPasswordExpiry) {
            return next(new Error("Invalid or expired reset code", { cause: 400 }));
        }

        if (!compareHash({plainText:code , hashValue:user.resetPasswordOtp})) {
            return next(new Error ("In-valid reset code", {cause: 400}))
        }

        await dbService.updateOne({
            model:userModel,
            filter:{email},
            data:{
                password:await generateHash({plainText: password}), 
                changeCridentialsTime: Date.now() ,$unset:{resetPasswordOtp: 0,resetOtpPasswordExpiry: 0}
            }
        })

        return successResponse({res})

    }
)

