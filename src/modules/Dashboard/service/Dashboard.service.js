import { AsyncHandeler } from "../../../utils/response/error.response.js";
import { successResponse } from './../../../utils/response/success.response.js';
import * as dbService from '../../../DB/dbService.js'
import userModel from "../../../DB/model/User.model.js";
import companyModel from "../../../DB/model/Company.model.js";

export const banOrUnbanUser = AsyncHandeler(async (req, res, next) => {

    const { userId } = req.params

    const user = await dbService.findById(
        {
            model: userModel,
            id: userId
        }
    )
    
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    if(user.roles !== 'user'){

        return next(new Error("Only regular users can be banned or unbanned", { cause: 403 }))

    }

    user.bannedAt = user.bannedAt ? null : new Date()

    await user.save()
    
    res.status(200).json({ message: user.bannedAt ? "User banned successfully" : "User unbanned successfully" })


})

export const baOrUnbanCompany = AsyncHandeler(
    async(req, res, next)=>{

        const {companyId} = req.params

        const company = dbService.findById({
            model:companyModel,
            filter:{companyId:company._id}
        })
        if(!company){
            return next(new Error ("Company not Found" , {cause:404}))
        }

        company.bannedAt = company.bannedAt ? null : new Date()

        await company.save()

        return successResponse({res, message:`Company ${company.bannedAt ? "banned" : "unbanned"} successfully` , data:{company}})
    }
)


export const approveCompany= AsyncHandeler(
    async( req, res, next)=>{

        const {companyId} = req.params

        const adminId = req.user._id
        const company = await dbService.findOne({
            model: companyModel,
            filter: {_id: companyId}
        })

        if (!company) {
            return next(new Error("Company not found!", { cause: 404 }));
        }

        if(company.isApproved){

            return next(new Error("Company is already approved!", { cause: 400 }));

        }

        const updatedCompany = await dbService.updateOne({
            model: companyModel,
            filter: { _id: companyId },
            data: { isApproved: true, approvedAt: new Date(), updatedBy: adminId }
        })

        return successResponse({ res, message: "Company approved successfully", data: { updatedCompany } })

    }
)