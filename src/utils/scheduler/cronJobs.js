import cron from 'node-cron'
import userModel from '../../DB/model/User.model.js'
import * as dbService from '../../DB/dbService.js'
import { AsyncHandeler } from '../response/error.response.js'

cron.schedule("0 0 * * *" , AsyncHandeler(
    async () => {

        const result = await dbService.updateMany({
            model: userModel,
            filter:{
                $or:[
                    {confirmEmailOtpExpiry:{ $lt:new Date }},
                    {resetOtpPasswordExpiry: { $lt: new Date()}}
                ]
            },
            data:{$unset:{confirmEmailOtp:1,confirmEmailOtpExpiry:1,resetPasswordOtp:1,resetOtpPasswordExpiry:1}}
        })
    },{
        scheduled: true,
        timezone: "Africa/Cairo"
    }
))