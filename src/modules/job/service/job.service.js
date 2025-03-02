import { AsyncHandeler } from "../../../utils/response/error.response.js"
import { successResponse } from '../../../utils/response/success.response.js'
import * as dbService from '../../../DB/dbService.js'
import companyModel from './../../../DB/model/Company.model.js'
import jobModel from "../../../DB/model/Job.model.js"

export const AddJob = AsyncHandeler(async(req, res , next)=>{

    const { jobTitle, jobLocation, workTime, seniorityLevel, jobDescription, technicalSkill, softSkills, companyId } = req.body

    const company = await dbService.findById({
        model:companyModel,
        id:companyId
    })

    if (!company) return next(new ErrorResponse("Company not found", 404))

    const job = await dbService.create({
        model: jobModel,
        data:{
            jobTitle,
            jobLocation,
            workTime,
            seniorityLevel,
            jobDescription,
            technicalSkill,
            softSkills,
            companyId,
            addedBy: req.user._id
        }
    })

        return successResponse({ res, message: "Job added successfully", data: job })
})

export const updateJob = AsyncHandeler(async (req, res, next) => {

    const { jobId } = req.params
    const { jobTitle, jobLocation, workTime, seniorityLevel, jobDescription, technicalSkill, softSkills } = req.body

    const job = await dbService.findById({
        model: jobModel,
        id: jobId
    }) 
    
    if (!job) return next(new ErrorResponse("Job not found", 404))

    if (!job.addedBy.equals(req.user._id)) {
        return next(new ErrorResponse("Unauthorized: Only the job owner can update this job", 403))
    }

    job.jobTitle = jobTitle || job.jobTitle
    job.jobLocation = jobLocation || job.jobLocation
    job.workTime = workTime || job.workTime
    job.seniorityLevel = seniorityLevel || job.seniorityLevel
    job.jobDescription = jobDescription || job.jobDescription
    job.technicalSkill = technicalSkill || job.technicalSkill
    job.softSkills = softSkills || job.softSkills
    job.updatedBy = req.user._id

    await job.save()

    return successResponse({ res, message: "Job updated successfully", data: job })
})

export const deleteJob = AsyncHandeler(async (req, res, next) => {
    const { jobId } = req.params

    const job = await dbService.findById({
        model:jobModel,
        id:jobId
    }) 

    if (!job) return next(new ErrorResponse("Job not found", 404))

    const company = await dbService.findById({
        model: companyModel,
        id: job.companyId
    }) 

    if (!company) return next(new ErrorResponse("Company not found", 404))

    if (!company.HR.includes(req.user._id)) {
        return next(new ErrorResponse("Unauthorized: Only company HR can delete this job", 403))
    }

    await dbService.deleteOne({
        model: jobModel,
        filter:{
            _id: jobId 
        }
    })

    return successResponse({ res, message: "Job deleted successfully" })
})

export const getAllJobsForCompany = AsyncHandeler(async (req, res, next) => {

    const { companyId } = req.params
    const { jobTitle, skip = 0, limit = 10, sort = '-createdAt', search } = req.query

    let filter = { companyId }

    if (jobTitle) {
        filter.jobTitle = { $regex: jobTitle, $options: "i" } 
    }

    if (search) {
        const company = await dbService.findOne({
            model: companyModel,
            filter: { name: { $regex: search, $options: "i" } }
        })
        if (!company) {
            return res.status(404).json({ message: "No company found with the given name" })
        }
        filter.companyId = company._id
    }

    const jobs = await dbService.find({
        model: jobModel,
        filter,
        skip: parseInt(skip),
        limit: parseInt(limit),
        sort,
    })

    const totalCount = await dbService.count({ model: jobModel, filter })

    return successResponse({
        res,
        message: "Jobs fetched successfully",
        data: { jobs, totalCount },
    })
})

export const getAllJobsMatchingFilters = AsyncHandeler(async (req, res, next) => {

    const {
        workingTime,
        jobLocation,
        seniorityLevel,
        jobTitle,
        technicalSkills,
        skip = 0,
        limit = 10,
        sort = '-createdAt',
    } = req.query

    let filter = {}

    if (workingTime) filter.workTime = workingTime
    if (jobLocation) filter.jobLocation = jobLocation
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel
    if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: "i" }

    if (technicalSkills) {
        filter.technicalSkill = { $in: technicalSkills.split(",") }
    }

    const jobs = await dbService.find({
        model: jobModel,
        filter,
        skip: parseInt(skip),
        limit: parseInt(limit),
        sort,
    })

    const totalCount = await dbService.count({ 
        model: jobModel, 
        filter
    })

    return successResponse({
        res,
        message: "Jobs fetched successfully",
        data: { jobs, totalCount },
    })
})

export const getApplicationsForJob = AsyncHandeler(async (req, res, next) => {

    const { jobId } = req.params
    const { skip = 0, limit = 10, sort = '-createdAt' } = req.query

    const job = await dbService.findOne({
        model: jobModel,
        filter: { _id: jobId },
        populate: {
            path: "applications",
            options: {
                skip: parseInt(skip),
                limit: parseInt(limit),
                sort,
            },
            populate: { path: "userId", select: "firstname lastname email" },
        },
    })

    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }

    const { addedBy, companyId } = job
    const userId = req.user._id

    const isAuthorized =
        String(userId) === String(addedBy) ||
        (await dbService.exists({
            model: userModel,
            filter: { _id: userId, HRs: companyId },
        }))

    if (!isAuthorized) {
        return next(new Error("You are not authorized to access these applications", { cause: 403 }))
    }

    const totalCount = job.applications.length

    return successResponse({
        res,
        message: "Applications fetched successfully",
        data: {
            applications: job.applications,
            totalCount,
        },
    })
})
