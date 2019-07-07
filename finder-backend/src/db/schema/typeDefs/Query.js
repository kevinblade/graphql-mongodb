// declare Query schema
module.exports = `
  type Query {
    books: [Book],
    findBooks(name: String): [Book]
  }
`
