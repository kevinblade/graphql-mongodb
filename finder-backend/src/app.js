require('./lib/env').config()
const Koa = require('koa')
const { ApolloServer } = require('apollo-server-koa')
const MongoClient = require('mongodb')
const db = require('./db')

const main = async () => {
  try {
    const client = await MongoClient.connect(process.env.DB_URL)
    const files = client.db('books').collection('files')
    console.log('MongoDB connection is opened.')

    const server = new ApolloServer({
      typeDefs: db.schema.typeDefs,
      resolvers: db.schema.resolvers,
      context: () => {
        return { collections: files }
      },
      introspection: true,
      playground: true,
      cors: {
        origin: '*', // <- allow request from all domains
        credentials: true
      },
      uploads: {
        maxFileSize: 10000000000, // 10 MB
        maxFiles: 4
      }
    })

    const app = new Koa()
    server.applyMiddleware({ app })

    app.listen({ port: 4000 }, () =>
      console.log(
        `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
      )
    )
  } catch (error) {
    console.error(error.message)
    return null
  }
}

main()
