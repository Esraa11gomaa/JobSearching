import { Router } from "express";
import { authentication } from './../../middleware/auth.middlware.js';
import * as userService from './service/user.service.js'
import * as validators from './user.validation.js'
import { validation } from "../../middleware/validation.middlware.js";
import { fileValidations, uploadCloudFile } from "../../utils/multer/cloud.multer.js";

const router = Router()

router.get("/profile", authentication(), userService.profile
)

router.get("/profile/:profileId",authentication(), userService.getUsersProfiles)

router.patch("/profile/update", validation(validators.updateProfile), authentication() ,userService.updateProfile
)

router.patch("/profile/upload-profile-image", authentication(), uploadCloudFile([...fileValidations.image]).single('file'),userService.uploadProfileImage)

router.patch("/profile/upload-cover-images", authentication(), uploadCloudFile([...fileValidations.image]).array("files", 5),userService.uploadcoverImages)

router.delete("/profile/delete-profile-image", authentication(), userService.deleteProfileImage)

router.delete("/profile/delete-cover-images", authentication(), userService.deleteCoverImages)

router.delete("/profile/soft-delete", authentication(), userService.softDeleteUser)

export default router
