import { rolesTypes } from "../../DB/model/User.model.js";


export const endpoint = {
    getApplication:[
        rolesTypes.owner,
        rolesTypes.Hr
    ],
    
}