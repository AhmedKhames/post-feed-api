const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type AuthData{
        token:String!
        userId: String!
    }

    type Query {
        login(email:String! , password : String!):AuthData!
    }

    type Post{
        title :String!
        imageUrl :String!
        content : String!
        creator:User!
        createdAt:String!
        updatedAt:String!
    }
    type User{
        _id:ID!
        email:String!
        password:String
        name:String!
        status: String!
        posts:[Post!]!
    }

    input userData {
        email:String!
        password:String
        name:String!
    }

    

    type Mutation {
        createUser(userInput :userData) : User!
        
    }
`);
