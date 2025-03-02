import { rolesTypes } from "../../DB/model/User.model.js";


export const endpoint = {
    applyToJob:[
        rolesTypes.user
    ],
    updateApplicationStatus:[
        rolesTypes.Hr
    ]
    
}
