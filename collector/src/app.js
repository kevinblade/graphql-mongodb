import 'dotenv/config'
import util from 'util'
import path from 'path'
import walk from 'walk'
import mongodb from './db'

// Start main function
;(async () => {
  const client = await mongodb.init()
  if (!client) return

  const collection = client.db('books').collection('files')
  try {
    await collection.drop()
    await collection.createIndex({ path: 1 })
    await collection.createIndex({ name: 1 })
    await collection.createIndex({ size: 1 })
  } catch (e) {
  } finally {
  }

  const walker = walk.walk(process.env.TRACK_FOLDER)
  walker.on('file', async (root, stat, next) => {
    // console.log(`file path: ${path.join(root, stat.name)}`)
    if (
      [
        '.pdf',
        '.epub',
        '.doc',
        '.docx',
        '.ppt',
        '.pptx',
        '.xls',
        '.xlsx'
      ].includes(path.extname(stat.name))
    ) {
      await collection.insertOne({ path: path.join(root, stat.name), ...stat })
    }
    next()
  })
  // walker.on('directory', async (root, stat, next) => {
  //   // console.log(`directory path: ${path.join(root, stat.name)}`)
  //   await collection.insertOne({ path: path.join(root, stat.name), ...stat })
  //   next()
  // })
  walker.on('error', (root, stat, next) => {
    console.error(`error: ${stat.error}`)
    next()
  })
  walker.on('done', async () => {
    console.log('Tracking is done.')
    await client.close()
  })
})()
