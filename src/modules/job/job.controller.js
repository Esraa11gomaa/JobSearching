import { Router } from "express";
import { authentication, authorization } from '../../middleware/auth.middlware.js';
import * as jobService from './service/job.service.js'
import * as validators from './job.validation.js'
import { validation } from "../../middleware/validation.middlware.js";
import { endpoint } from "./job.endpoint.js";

const router = Router()

router.post("/add", validation(validators.addJob),authentication(), jobService.AddJob) 

router.put("/update/:jobId", validation(validators.updateJob),authentication(), jobService.updateJob)

router.delete("/delete/:jobId", validation(validators.deleteJob) ,authentication(), jobService.deleteJob)

router.get("/company/:companyId", validation(validators.getAllJobsForCompany) ,authentication(), jobService.getAllJobsForCompany)

router.get("/matching", validation(validators.getAllJobsMatchingFilters) ,authentication(), jobService.getAllJobsMatchingFilters)

router.get("/:jobId/applications",validation(validators.getApplicationForJob) ,authentication(), authorization(endpoint.getApplication),jobService.getApplicationsForJob)

export default router
