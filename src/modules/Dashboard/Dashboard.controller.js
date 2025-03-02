import { Router } from "express";
import { authorization, authentication} from './../../middleware/auth.middlware.js';
import * as dashboard from './service/Dashboard.service.js'
import { endPoint } from "./Dashboard.endpoint.js";

const router = Router()

router.patch("/ban/:userId", authentication(), authorization(endPoint.banOrUnbanUser) , dashboard.banOrUnbanUser
)

router.patch("/ban/:companyId", authentication(), authorization(endPoint.banOrUnbanCompany) ,dashboard.baOrUnbanCompany
)

router.patch("/approve-company/:companyId", authentication(), authorization(endPoint.ApproveCompany) ,dashboard.approveCompany
)

export default router
