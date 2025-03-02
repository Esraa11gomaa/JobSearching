import connectDB from "./DB/connection.js"
import authController from './modules/auth/auth.controller.js'
import { globalErrorHandeling } from "./utils/response/error.response.js"
import userController from './modules/user/user.controller.js'
import dashboardController from './modules/Dashboard/Dashboard.controller.js'
import companyController from './modules/company/company.controller.js'
import jobController from './modules/job/job.controller.js'
import chatController from './modules/chat/chat.controller.js'
import applicationController from './modules/application/application.controller.js'
import cors from 'cors'
import { graphqlHTTP } from 'express-graphql'
import schema from "./modules/graphQl/schema.js"


const bootstrap = (app, express) => {
    app.use(cors())
    app.use(express.json())
    app.use("/graphql", graphqlHTTP({
        schema,
        graphiql: true 
    }))
    
    app.get("/", (req, res, next) => {
        return res.status(200).json({ message: "Welcome in node.js project powered by express and ES6" })
    })
    app.use("/auth", authController)
    app.use("/user", userController)
    app.use("/dashboard",dashboardController)
    app.use("/company",companyController)
    app.use("/job",jobController)
    app.use("/chat",chatController)
    app.use("/application",applicationController)

    
    app.all("*", (req, res, next) => {
        return res.status(404).json({ message: "In-valid routing" })
    })
    app.use(globalErrorHandeling)
    connectDB()
}

export default bootstrap