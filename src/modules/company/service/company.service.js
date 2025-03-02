import { AsyncHandeler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js"
import * as dbService from '../../../DB/dbService.js'
import companyModel from '../../../DB/model/Company.model.js'
import { model, Types } from 'mongoose'
import { cloud } from "../../../utils/multer/cloudinary.multer.js"


export const addComapany = AsyncHandeler(
   async(req, res , next)=>{

    const {companyName, companyEmail, description, industry, address, numberOfEmployees } = req.body

    if(!req.user || !req.user._id){
        return next(new Error("Unauthorized request", { cause: 401 }))
    }

    const existingCompany = await
     dbService.findOne({
        model: companyModel,
        filter:{
            $or: 
            [
                { companyName },
                { companyEmail }
            ]
        }
    })

    if (existingCompany) {
        return next(new Error("Company name or email already exists", { cause: 409 }))
    }

    const newCompany = await dbService.create({
        model: companyModel,
        data:{
            companyName,
            companyEmail,
            description,
            industry,
            address,
            numberOfEmployees,
            createdBy: req.user._id
        }
    })

    return successResponse({ res, message: "Company added successfully", status: 201, data: { newCompany } })

   }
)

export const updateCompany = AsyncHandeler(async (req, res, next) => {
    const { companyId } = req.params

    if (!req.user || !req.user._id) {
        return next(new Error("Unauthorized request", { cause: 401 }))
    }

    const company = await dbService.findById({
        model: companyModel,
        id: companyId
    }) 

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }

    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new Error("You are not authorized to update this company", { cause: 403 }))
    }

    delete req.body.legalAttachment

    const updatedCompany = await dbService.findByIdAndUpdate({
        model: companyModel,
        id: companyId,
        data: req.body,
        options:{new:true}
    })

    return successResponse({ res, message: "Company updated successfully", status: 200 , data: { updatedCompany } })
})

export const softeDeleteCompany = AsyncHandeler(async (req, res, next) => {
    const { companyId } = req.params

    if (!req.user || !req.user._id) {
        return next(new Error("Unauthorized request", { cause: 401 }))
    }

    const company = await dbService.findById({
        model: companyModel,
        id: companyId
    }) 

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }

    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new Error("You are not authorized to update this company", { cause: 403 }))
    }

    const deletedCompany = await dbService.findByIdAndUpdate({
        model: companyModel,
        id: companyId,
        data: { deletedAt: new Date() }, 
        options: { new: true }
    })


    return successResponse({ res, message:  "Company deleted successfully", status: 200 , data: {  deletedCompany } })
})

export const getCompanyWithJobs = AsyncHandeler(async (req, res, next) => {
    const { companyId } = req.params

    if (!Types.ObjectId.isValid(companyId)) {
        return next(new Error("Invalid company ID", { cause: 400 }))
    }

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId },
        options: { populate: "jobs" } 
    })

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }

    return successResponse({ res, message:"Company fetched successfully", status: 200 , data: {  company } })
    
})

export const searchCompany = AsyncHandeler(async (req, res, next) => {

    const { companyName } = req.query

    if (!companyName) {
        return next(new Error("Company name is required for search", { cause: 400 }))
    }

    const companies = await dbService.find({
        model: companyModel,
        filter: { companyName: { $regex: companyName, $options: "i" } },
        options: { select: "companyName industry address numberOfEmployees" }
    })

    if (!companies.length) {
        return next(new Error("No companies found", { cause: 404 }))
    }

    return successResponse({ res, message: "Companies fetched successfully", status: 200, data: { companies } })
})


export const uploadCompanyLogo = AsyncHandeler(async (req, res, next) => {
    const { companyId } = req.params

    const company = await dbService.findById({
        model: companyModel,
        id: companyId
    });

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }

    if (!req.file) {
        return next(new Error("No file uploaded", { cause: 400 }))
    }

    cloud.uploader.upload_stream(
        {
            folder: `${process.env.App_Name}/company/${company}/logo`,
            resource_type: "auto"
        },
        async (error, result) => {
            if (error) {
                return next(new Error("Cloudinary upload failed", { cause: 500 }));
            }

            await dbService.updateOne({
                model: companyModel,
                filter: { _id: companyId },
                data: { logo: result.secure_url }
            });

            return successResponse({
                res,
                message: "Company logo updated successfully",
                data: { logo: result.secure_url }
            });
        }
    ).end(req.file.buffer);
});


export const uploadCompanyCover = AsyncHandeler(async (req, res, next) => {
    const { companyId } = req.params;

    if (!req.files || req.files.length === 0) {
        return next(new Error("No files uploaded", { cause: 400 }));
    }

    const uploadPromises = req.files.map((file) =>
        new Promise((resolve, reject) => {
            cloud.uploader.upload_stream(
                {
                    folder: `${process.env.App_Name}/company/${companyId}/cover`,
                    resource_type: "auto"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({ secure_url: result.secure_url, public_id: result.public_id });
                }
            ).end(file.buffer);
        })
    );

    const uploadedImages = await Promise.all(uploadPromises);

    await dbService.updateOne({
        model: userModel,
        filter: { _id: companyId },
        data: { coverImages: uploadedImages }
    });

    return successResponse({
        res,
        message: "Cover images uploaded successfully",
        data: { coverImages: uploadedImages }
    });
});

export const deletelogo = AsyncHandeler(async (req, res, next) => {
    const { companyId } = req.params;

    const userData = await dbService.findOne({
            model:companyModel,
            filter:{_id: companyId  }
        })

        if (!userData) {
            return next (new Error ("Account is Not Authorized", {cause: 404}))
        }

        if (!userData.logo) {
            return next(new Error("No Comany Logo found", { cause: 404 }));
        }

        await cloud.uploader.destroy(userData.logo);

        userData.logo = null;
        await userData.save();

    return successResponse({ res, message:"Comany Logo is deleted successfully"});
});

export const deleteCoverImages = AsyncHandeler(async (req, res, next) => {
    const { companyId } = req.params
    const { public_id } = req.body

    if (!public_id) {
        return next(new Error("Cover image public_id is required", { cause: 400 }))
    }

    const company = await dbService.findOne({
        model: companyModel, 
        filter: { _id: companyId },
    })

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }

    if (!Array.isArray(company.coverImages)) {
        return next(new Error("coverImages is not an array", { cause: 500 }))
    }

    const imageExists = company.coverImages.some(img => img.public_id === public_id)
    if (!imageExists) {
        return next(new Error("Cover image not found", { cause: 404 }))
    }

    await cloud.uploader.destroy(public_id)

    company.coverImages = company.coverImages.filter(img => img.public_id !== public_id)
    await company.save()

    return successResponse({
        res,
        message: "Cover Image deleted successfully",
        data: { coverImages: company.coverImages },
    })
})
