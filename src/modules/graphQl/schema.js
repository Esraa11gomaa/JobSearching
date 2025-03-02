import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import userModel from "../../DB/model/User.model.js";
import companyModel from '../../DB/model/Company.model.js';
import * as dbService from '../../DB/dbService.js'

const UserType = new GraphQLObjectType({
    name:"User",
    fields:()=>({
        id:{type:GraphQLID},
        firstname:{ type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        profileImage: { 
            type: GraphQLString,
            resolve: (user) => user.profileImage?.secure_url || null
        },
        isDeleted: { type: GraphQLBoolean },
        roles: { type: GraphQLString } 
    })
})

const CompanyType = new GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        website: { type: GraphQLString },
        isDeleted: { type: GraphQLBoolean },
        industry: { type: GraphQLString }, 
        location: { type: GraphQLString } 
    })
})

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        getAllData: {
            type: new GraphQLObjectType({
                name: "AllUsersAndCompanies",
                fields: {
                    users: { 
                        type: new GraphQLList(UserType) 
                    },
                    companies: { type: new GraphQLList(CompanyType) }
                }
            }),
            resolve: async () => {
                const users = dbService.find({
                    model: userModel
                })

                const companies = dbService.find({
                    model: companyModel
                })
                
                return { users, companies }
            }
        }
    }
})

export default new GraphQLSchema({
    query: RootQuery
})