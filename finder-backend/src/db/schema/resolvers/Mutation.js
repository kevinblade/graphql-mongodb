const { ObjectID } = require('mongodb')

module.exports = {
  deleteBook: async (_, args, { collections: files }) => {
    console.log(`args._id = [${args._id.trim()}]`)
    const deleted = await files.deleteOne({ _id: new ObjectID(args._id.trim()) })
    return deleted.result.ok
  }
}
