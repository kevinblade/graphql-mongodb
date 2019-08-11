// declare Query schema
module.exports = `
  input BookInput {
    name: String
    path: String
    size: Int
    ctime: String
    reading: Boolean
  },

  type Mutation {
    deleteBook(_id: String): Boolean
    updateBook(_id: String, book: BookInput): Boolean
  }
`
