import { Router } from 'express'
import * as applicationService from './service/application.service.js'
import * as validators from './application.validation.js'
import { validation } from '../../middleware/validation.middlware.js';
import { authentication, authorization } from '../../middleware/auth.middlware.js';
import { endpoint } from './application.endpoint.js';

const router = Router();


router.post("/apply", validation(validators.application),authentication(),authorization(endpoint.applyToJob),applicationService.applyToJob)

router.patch("/:applicationId/status", validation(validators.updateApplicationStatus),authentication(),authorization(endpoint.updateApplicationStatus),applicationService.updateApplicationStatus)

router.get("/export", validation(validators.exportApplicationsToExcel),authentication, applicationService.exportApplicationsToExcel)


export default router