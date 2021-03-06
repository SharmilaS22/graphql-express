const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql');


const app = express();

// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'test',
//         fields: () => ({
//             message: {
//                 type: GraphQLString,
//                 resolve: () => 'My first graphql query'
//             },
//             hello: {
//                 type: GraphQLString,
//                 resolve: () => 'Hello world'
//             }
//         })
//     })
// })

const booksList = [
    { id: 1, title: "HP1", authorid: 1},
    { id: 2, title: "HP2", authorid: 1},
    { id: 3, title: "MoOE", authorid: 2},
    { id: 4, title: "MoRA", authorid: 2},
];

const authorsList = [
    { id: 1, authorName: "JKR"},
    { id: 2, authorName: "AC"}
]

const AuthorType = new GraphQLObjectType({
    name: 'author',
    description: 'Author object',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        authorName: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(BookType),
            resolve: (author) => {
                return booksList.filter(bk => bk.authorid === author.id)
                // return booksList.find(book => book.authorid === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'book',
    description: 'Book object',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLNonNull(GraphQLString) },
        authorid: { type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType,
            resolve: (book) => {
                return authorsList.find(author => author.id === book.authorid)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'rootquery',
    description: 'root',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A book object',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return booksList.find(book => book.id === args.id)
            }
        },
        books: {
            type: GraphQLList(BookType),
            description: 'List of all books',
            resolve: () => booksList
        },
        author: {
            type: GraphQLList(AuthorType),
            description: 'List of all authors',
            resolve: () => authorsList
        }
    })
})

const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a new book',
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                authorid: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book1 = {
                    id: booksList.length + 1,
                    title: args.title,
                    authorid: args.authorid
                }
                booksList.push(book1)
                return book1
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add a new author',
            args: {
                authorName: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author1 = {
                    id: authorsList.length + 1,
                    authorName: args.authorName
                }
                authorsList.push(author1)
                return author1
            }
        }
    })
})

const BooksSchema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
}) 


app.use('/graphql', expressGraphQL({
    graphiql: true,
    schema: BooksSchema
}))


app.listen(3000, () => console.log("server running at port 3000"));