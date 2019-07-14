// declare Book schema
module.exports = `
  type Book {
    _id: String
    name: String
    path: String
    size: Int
    mtime: String
    dup_files: [DupBook]
  }
`
