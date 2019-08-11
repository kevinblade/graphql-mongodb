const util = require('util')
const { ObjectID } = require('mongodb')

module.exports = {
  // API Reference: https://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#deleteOne
  deleteBook: async (_, args, { collections: files }) => {
    console.log(`args._id = [${args._id.trim()}]`)
    const deleted = await files.deleteOne({ _id: new ObjectID(args._id.trim()) })
    // API Reference: https://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#~deleteWriteOpResult
    return deleted.result.ok
  },

  // API Reference: https://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#updateOne
  updateBook: async (_, args, { collections: files }) => {
    console.log(`args._id = [${args._id.trim()}]`)
    console.log(`args.book = [${util.inspect(args.book)}]`)
    const updated = await files.updateOne({ _id: new ObjectID(args._id.trim()) }, { $set: { ...args.book } })
    // API Reference: https://mongodb.github.io/node-mongodb-native/3.3/api/Collection.html#~updateWriteOpResult
    return updated.result.ok
  }
}
