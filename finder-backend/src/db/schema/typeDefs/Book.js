// declare Book schema
module.exports = `
  type Book {
    _id: String
    name: String
    path: String
    size: Int
    ctime: String
    reading: Boolean
    dup_files: [DupBook]
  }
`
