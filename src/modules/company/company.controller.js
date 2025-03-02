import { Router } from 'express'
import * as companyService from './service/company.service.js';
import * as validators from './company.validation.js'
import { validation } from '../../middleware/validation.middlware.js';
import { authentication, authorization } from '../../middleware/auth.middlware.js';
import { endpoint } from './comapny.endpoint.js';
import { fileValidations, uploadCloudFile } from "../../utils/multer/cloud.multer.js"

const router = Router();


router.post("/add", validation(validators.addCompanyValidation),authentication(),companyService.addComapany)

router.patch("/update/:companyId", validation(validators.updateCompany), authentication(), companyService.updateCompany)

router.delete("/softdelete/:companyId", authentication(),authorization(endpoint.companySoftDelete), companyService.softeDeleteCompany)

router.get("/:companyId", validation(validators.getCompany), authentication(), companyService.getCompanyWithJobs);

router.get("/search", validation(validators.searchCompany), authentication(), companyService.searchCompany);

router.patch("/upload-company-image/:companyId",authentication(), uploadCloudFile([...fileValidations.image]).single('file'), companyService.uploadCompanyLogo)

router.patch("/upload-cover-images/:companyId", authentication(), uploadCloudFile([...fileValidations.image]).array("files", 5),companyService.uploadCompanyCover)

router.delete("/delete-logo/:companyId", authentication(), companyService.deletelogo)

router.delete("/delete-cover-images/:companyId", authentication(), companyService.deleteCoverImages)

export default router