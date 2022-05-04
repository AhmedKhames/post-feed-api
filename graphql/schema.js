const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type AuthData{
        token:String!
        userId: String!
    }

    type PostsData{
        posts : [Post!]!
        totalPosts : Int!
    }

    type Query {
        login(email:String! , password : String!):AuthData!
        posts(page : Int) :PostsData!
        post(id : ID!):Post!
        user : User!
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

    input postData{
        title : String!
        content : String!
        imageUrl : String!

    }

    type Mutation {
        createUser(userInput :userData) : User!
        createPost(postInput :postData) : Post!
        editPost(id:ID! , postInput:postData) : Post!
        deletePost(id:ID!) : Boolean
        updateStatus(status : String!):User!
    }
`);
