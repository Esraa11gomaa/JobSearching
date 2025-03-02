import { decodedToken, tokenTypes } from '../utils/security/token.js';
import { AsyncHandeler } from './../utils/response/error.response.js';

export const authentication = ()=>{
    return AsyncHandeler(
        async(req, res, next)=>{
            const {authorization} = req.headers
        
            req.user = await decodedToken({authorization, tokenType: tokenTypes.access ,next })

            if (!req.user) {
                return next(new Error("Unauthorized request", { cause: 401 }));
            }

            return  next ()
        }
    )
}



export const authorization = ( accessRoles = [])=>{
    return AsyncHandeler(
        async(req, res, next)=>{

            if (!req.user || !accessRoles.includes(req.user.roles)) {
                return next(new Error("Not Authorized account", { cause: 403 }));
            }
           
            return  next ()
        }
    )
}