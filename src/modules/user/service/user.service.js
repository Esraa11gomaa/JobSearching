import { AsyncHandeler } from "../../../utils/response/error.response.js";
import { successResponse } from './../../../utils/response/success.response.js';
import * as dbService from '../../../DB/dbService.js'
import userModel from "../../../DB/model/User.model.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { generateEncryption } from "../../../utils/security/encryption.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { decodedToken } from "../../../utils/security/token.js";
import { tokenTypes } from './../../../utils/security/token.js';

export const profile = AsyncHandeler(async(req, res , next)=>{

    const user = await dbService.findById({
        model: userModel,
        id: req.user._id,
        select: "firstname lastname phone DOB gender"
    })

    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    user.phone = user.getMobileNumber()

    return successResponse({
        res,
        data: {
            userName: `${user.firstname} ${user.lastname}`,
            mobileNumber: user.phone,
            DOB: user.DOB,
            gender: user.gender
        }
    })
})

export const getUsersProfiles = AsyncHandeler(
    async(req, res, next )=>{

        const {profileId} = req.params

        const user = await dbService.findOne({
            model:userModel,
            filter:{_id:profileId, isDeleted: false},
            select:"firstname lastname phone profileImage coverImages" 
        })

        if (!user) {
            return next(new Error ("User not Found", {cause: 404}))
        }

        const decryptedPhone = user.getMobileNumber()    

        return successResponse({
            res,
            data: {
                user:{
                    userName: ` ${user.firstname} ${user.lastname}` ,
                    mobileNumber: decryptedPhone,
                    profileImage: user.profileImage,
                    coverImages: user.coverImages
                }
            }
        });
})

export const updateProfile = AsyncHandeler(
    async (req, res, next) => {
        
        const{firstname, lastname, phone, DOB, gender} = req.body

        let updateData = {}

        if (firstname) updateData.firstname = firstname
        if (lastname) updateData.lastname = lastname
        if (DOB) updateData.DOB = DOB;
        if (gender) updateData.gender = gender

        if (phone) {
            updateData.phone =generateEncryption({plainText:phone})
        }

        const updatedUser = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data:updateData,
            options:{new:true},
            select:"firstname lastname phone DOB gender"
        })

        return updatedUser ? successResponse({res,message:"Profile updated successfully", data: {updatedUser}}) : next(new Error("User Not Found", {cause:404} ))
    }
)


export const updatePassword = AsyncHandeler(
    async(req, res, next)=>{

        const {oldPassword, password ,confirmationPassword} = req.body

        if (!compareHash({plainText: oldPassword, hashValue: req.user.password})) {
            
            return next(new Error("In-valid old password", {cause:400}))
        }

        if (password !== confirmationPassword) {
            return next(new Error("Confirmation password does not match", { cause: 400 }));

        }
        await dbService.updateOne({
            model: userModel,
            filter:{_id:req.user._id},
            data:{
                password: await generateHash({plainText: password}),
                changeCridentialsTime:Date.now(),
            }
        })
       
        
        return successResponse({ res, data:{}});
    }
)

export const uploadProfileImage = AsyncHandeler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error("No file uploaded", { cause: 400 }));
    }

    cloud.uploader.upload_stream(
        {
            folder: `${process.env.App_Name}/user/${req.user._id}/profile`,
            resource_type: "auto"
        },
        async (error, result) => {
            if (error) {
                return next(new Error("Cloudinary upload failed", { cause: 500 }));
            }

            await dbService.updateOne({
                model: userModel,
                filter:{_id: req.user._id},
                data:{profileImage: result.secure_url}
            })

            return successResponse({
                res,
                message: "Profile picture updated successfully",
                data: { profileImage: result.secure_url }
            });
        }
    ).end(req.file.buffer);
});

export const uploadcoverImages = AsyncHandeler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new Error("No files uploaded", { cause: 400 }));
    }

    const uploadPromises = req.files.map((file) =>
        new Promise((resolve, reject) => {
            cloud.uploader.upload_stream(
                {
                    folder: `${process.env.App_Name}/user/${req.user._id}/cover`,
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
        filter: { _id: req.user._id },
        data: { coverImages: uploadedImages }
    });

    return successResponse({
        res,
        message: "Cover images uploaded successfully",
        data: { coverImages: uploadedImages }
    });
});

export const deleteProfileImage = AsyncHandeler(async (req, res, next) => {

    const {authorization} = req.headers

    const user = await  decodedToken({authorization,tokenType: tokenTypes.access , next})

    const userData = await dbService.findOne({
            model:userModel,
            filter:{_id: user._id  }
        })

        if (!userData) {
            return next (new Error ("Account is Not Authorized", {cause: 404}))
        }

        if (!userData.profileImage) {
            return next(new Error("No profile image found", { cause: 404 }));
        }

        await cloud.uploader.destroy(userData.profileImage);

        userData.profileImage = null;
        await userData.save();

    return successResponse({ res, message:"Profile Image is deleted successfully"});
});

export const deleteCoverImages = AsyncHandeler(async (req, res, next) => {

    const {authorization} = req.headers
    const {public_id} = req.body

    if(!public_id){
        return next(new Error("Cover image public_id is required", { cause: 400 }));
    }

    const user = await  decodedToken({authorization,tokenType: tokenTypes.access , next})

    const userData = await dbService.findOne({
            model:userModel,
            filter:{_id: user._id  }
        })

        if (!userData) {
            return next (new Error ("Account is Not Authorized", {cause: 404}))
        }

        if (!Array.isArray(userData.coverImages)) {
            return next(new Error("coverImages is not an array", { cause: 500 }));
        }

        const imageExists = userData.coverImages.some(img => img.public_id === public_id)

        if (!imageExists) {
            
            return next(new Error("Cover image not found", { cause: 404 }));
        }
        await cloud.uploader.destroy(public_id);

        const image_deleted = userData.coverImages = userData.coverImages.filter(img => img.public_id !== public_id)

        await userData.save();

    return successResponse({ res, message:"Cover Images is deleted successfully", data:{image_deleted}});
})

export const softDeleteUser = AsyncHandeler(async(req, res, next)=>{

    const userId = req.user._id

    const user = await dbService.findById({
        model:userModel,
        id:userId
    })
    if (!user) {
        throw new Error("User Not Found") 
    }

    if (user.isDeleted) {
        throw new Error("User account is already deleted")
    }

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save()
    
    return successResponse({res,message:"Account deleted successfully"})
})

