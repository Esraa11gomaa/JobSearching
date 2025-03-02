import XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path"
import { AsyncHandeler } from "../../../utils/response/error.response.js";
import * as dbService from '../../../DB/dbService.js'
import jobModel from "../../../DB/model/Job.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import applicationModel from "../../../DB/model/Application.model.js";
import io from "../../../utils/socket/socket.js";
import { sendEmail } from "../../../utils/email/send.email.js";


export const applyToJob = AsyncHandeler(
    async(req, res , next)=>{

        const{jobId, userCV} = req.body
        const userId = req.user._id

        const job = await dbService.findById({
            model: jobModel,
            id: jobId
        })

        if (!job) return next(new Error("Job not found", { cause: 404 }));

    const existingApplication = await dbService.findOne({
        model: applicationModel,
        filter:{jobId, userId}
    }) 

    if (existingApplication) {
        return next(new Error("You have already applied for this job", { cause: 400 }));
    }

    const application = await dbService.create({
        model: applicationModel,
        data:{
            jobId, 
            userId, 
            userCV 
        }
    })

    io.to(job.companyId.toString()).emit("newApplication", { jobId, userId });

    return successResponse({res,message: "Application submitted successfully" , data: {application}})

})

export const updateApplicationStatus = AsyncHandeler(async (req, res, next) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Find the application and populate related data
    const application = await dbService.findById({
        model: applicationModel,
        id:applicationId.populate("userId jobId")
    }) 

    if (!application) return next(new Error("Application not found", { cause: 404 }));

    // Ensure the HR is authorized to update the application
    if (String(application.jobId.companyId) !== String(req.user.companyId)) {
        return next(new Error("You are not authorized to update this application", { cause: 403 }));
    }

    // Update application status
    application.status = status;
    await application.save();

    // Send an email notification to the applicant
    const user = application.userId;
    let emailContent = {};

    if (status === "accepted") {
        emailContent = {
            subject: "Job Application Accepted",
            message: `Congratulations ${user.firstname}, your application for the job "${application.jobId.jobTitle}" has been accepted. Our team will contact you soon.`
        };
    } else {
        emailContent = {
            subject: "Job Application Rejected",
            message: `Dear ${user.firstname}, we regret to inform you that your application for the job "${application.jobId.jobTitle}" has been rejected. Thank you for your interest.`
        };
    }

    sendEmail(user.email, emailContent.subject, emailContent.message);

    // Emit a socket event to notify the user about status update
    io.to(user._id.toString()).emit("applicationStatusUpdated", {
        applicationId,
        status,
        message: emailContent.message
    })

    return successResponse({res, message:`Application ${status} successfully` , data:{application}})
   
})


export const exportApplicationsToExcel = AsyncHandeler(async (req, res, next) => {
    const { companyId, date } = req.query;

    if (!companyId || !date) {
        return next(new Error("Company ID and date are required", { cause: 400 }));
    }

    // Convert date to start and end of the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find all jobs for the company
    const jobs = await dbService.find({
        mode: jobModel,
        filter: { companyId },
        select: "_id"
    })

    if (!jobs.length) {
        return next(new Error("No jobs found for this company", { cause: 404 }));
    }

    const jobIds = jobs.map(job => job._id);

    // Find applications for these jobs created on the specified date
    const applications = await dbService.find({
        model: applicationModel,
        filter:{jobId: { $in: jobIds },
        createdAt: { $gte: startDate, $lte: endDate }}.populate("userId", "firstname lastname email")
    })

    if (!applications.length) {
        return next(new Error("No applications found for the given date", { cause: 404 }));
    }

    // Prepare data for Excel
    const applicationData = applications.map(app => ({
        JobID: app.jobId,
        ApplicantName: `${app.userId.firstname} ${app.userId.lastname}`,
        Email: app.userId.email,
        Status: app.status,
        AppliedOn: app.createdAt.toISOString(),
    }));

    // Create Excel sheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(applicationData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    // Define file path
    const filePath = path.join("uploads", `applications_${companyId}_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, filePath);

    // Send file as a response
    res.download(filePath, () => {
        // Delete file after download
        fs.unlinkSync(filePath);
    });
});
