import 'dotenv/config'
import util from 'util'
import path from 'path'
import walk from 'walk'
import chokidar from 'chokidar'
import mongodb from './db'

let total = 0

const _isIncludes = (stat) => ((stat.type && (stat.type.toLowerCase() === 'file') && [
  '.pdf', '.epub', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'
].includes(path.extname(stat.name))) || (stat.type && (stat.type.toLowerCase() === 'directory') && stat.name.match(/.*\[video\].*/i)))

// Something to use when events are received.
const log = {
  info: console.log.bind(console),
  error: console.error.bind(console)
}

const _insertStat = async ({ collection, root, stat }) => {
  // log.info(`stat = ${util.inspect(stat)}`)
  if (_isIncludes(stat)) {
    stat.name = stat.name.normalize('NFC')
    const filePath = path.join(root, stat.name)
    const data = await collection.findOne({ path: filePath })
    if (!data) {
      total++
      await collection.insertOne({ path: filePath, ...stat })
      if (!(total % 1000)) {
        log.info(`total = ${total}`)
      }
      if (stat.type.toLowerCase() === 'file') {
        log.info(`File ${filePath} has been added.`)
      } else if (stat.type.toLowerCase() === 'directory') {
        log.info(`Directory ${filePath} has been added`)
      }
    }
  }
}

const _initWatcher = ({ collection }) => {
  const root = process.env.TRACK_FOLDER

  // Initialize watcher.
  const watcher = chokidar.watch(root, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    awaitWriteFinish: true,
    alwaysStat: true,
    cwd: root
  })

  watcher
    .on('add', async (addedPath, stat) => {
      await _insertStat({ collection, root, stat })
    })
    .on('addDir', async (addedDir, stat) => {
      await _insertStat({ collection, root, stat })
    })
    .on('change', (changedPath, stat) => {
      if (stat) {
        log.info(`File ${changedPath} changed size to ${stat.size}`)
      }
    })
    .on('unlink', async unlinkPath => {
      log.info(`File ${unlinkPath} has been removed.`)
      await collection.deleteOne({ path: unlinkPath })
    })
    .on('unlinkDir', async unlinkPath => {
      log.info(`Directory ${unlinkPath} has been removed.`)
      await collection.deleteOne({ path: unlinkPath })
    })
}

const _initWalker = ({ client, collection }) => {
  const walker = walk.walk(process.env.TRACK_FOLDER)

  walker
    .on('file', async (root, stat, next) => {
      // log.info(`file path: ${path.join(root, stat.name)}`)
      await _insertStat({ collection, root, stat })
      next()
    })
    .on('directory', async (root, stat, next) => {
      // (`directory path: ${path.join(root, stat.name)}`)
      await _insertStat({ collection, root, stat })
      next()
    })
    .on('error', (root, stat, next) => {
      log.error(`error: ${stat.error}`)
      next()
    })
    .on('end', async () => {
      log.info('Tracking is end.')
      log.info(`total = ${total}`)
      await client.close()
    })
}

// Start main function
{
  ; (async () => {
    const client = await mongodb.init()
    if (!client) return

    const collection = client.db('books').collection('files')
    // try {
    //   await collection.drop()
    //   await collection.createIndex({ path: 1 })
    //   await collection.createIndex({ name: 1 })
    //   await collection.createIndex({ size: 1 })
    // } catch (e) {
    // } finally {
    // }

    _initWatcher({ collection })
    _initWalker({ client, collection })
  })()
}