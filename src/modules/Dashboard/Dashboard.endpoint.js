import { rolesTypes } from "../../DB/model/User.model.js";


export const endPoint = {
    banOrUnbanUser:[
        rolesTypes.admin
    ],
    banOrUnbanCompany:[
        rolesTypes.admin
    ],
    ApproveCompany:[
        rolesTypes.admin
    ]
}
