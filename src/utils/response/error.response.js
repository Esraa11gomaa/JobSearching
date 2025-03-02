export const AsyncHandeler = (fn)=>{

    return (req, res, next)=>{
        return fn(req, res, next).catch(error =>{
            error.cause = 500
            return next (error)
        })
    }
}

export const globalErrorHandeling = (error, req, res, next)=>{
    if (process.env.MOOD ==="DEV") {
        return res.status(error.cause || 400).json({mrssage: error.message, stack: error.stack})
    }

    return res.status(error.cause || 400).json({mrssage: error.message, error})
}