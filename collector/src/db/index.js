import MongoClient from 'mongodb'

export default {
  init: async db => {
    try {
      const client = await MongoClient.connect(process.env.DB_URL)
      console.log('MongoDB connection is opened.')
      return client
    } catch (error) {
      console.error(error.message)
      return null
    }
  }
}
