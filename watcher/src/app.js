import 'dotenv/config'
import util from 'util'
import path from 'path'
import chokidar from 'chokidar'
import _ from 'lodash'
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
  try {
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
          log.info(`File: ${filePath} has been added.`)
        } else if (stat.type.toLowerCase() === 'directory') {
          log.info(`Directory: ${filePath} has been added.`)
        }
        // } else {
        //   if (data.size !== stat.size) {
        //     await collection.updateOne({ path: filePath }, { $set: { ...stat } })
        //     if (stat.type.toLowerCase() === 'file') {
        //       log.info(`File: ${filePath} has been updated.`)
        //     } else if (stat.type.toLowerCase() === 'directory') {
        //       log.info(`Directory: ${filePath} has been updated.`)
        //     }
        //   }
      }
    }
  } catch (error) {
    log.error(`Error: ${error.message}`)
  }
}

const _initWatcher = ({ collection }) => {
  const root = process.env.HOST_TRACK_FOLDER

  // Initialize watcher.
  const watcher = chokidar.watch(process.env.TRACK_FOLDER, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    awaitWriteFinish: true,
    alwaysStat: true,
    cwd: process.env.TRACK_FOLDER
  })

  watcher
    .on('add', async (addedPath, stat) => {
      try {
        if (stat) {
          await _insertStat({
            collection,
            root: path.join(root, path.dirname(addedPath)),
            stat: {
              ...stat,
              type: 'file',
              name: path.basename(addedPath),
            }
          })
        }
      } catch (error) {
        log.error(`Error: ${error.message}`)
      }
    })
    .on('addDir', async (addedDir, stat) => {
      try {
        if (stat) {
          await _insertStat({
            collection,
            root: path.join(root, path.dirname(addedDir)),
            stat: {
              ...stat,
              type: 'directory',
              name: path.basename(addedDir),
            }
          })
        }
      } catch (error) {
        log.error(`Error: ${error.message}`)
      }
    })
    .on('change', async (changedPath, stat) => {
      if (stat) {
        // log.info(`File: ${changedPath} changed size to ${stat.size}`)
      }
    })
    .on('unlink', async unlinkPath => {
      try {
        log.info(`File: ${unlinkPath} has been removed.`)
        await collection.deleteOne({ path: path.join(root, unlinkPath) })
      } catch (error) {
        log.error(`Error: ${error.message}`)
      }
    })
    .on('unlinkDir', async unlinkPath => {
      try {
        log.info(`Directory: ${unlinkPath} has been removed.`)
        await collection.deleteOne({ path: path.join(root, unlinkPath) })
      } catch (error) {
        log.error(`Error: ${error.message}`)
      }
    })
}

// Start main function
{
  ; (async () => {
    const client = await mongodb.init()
    if (!client) return

    const collection = client.db('books').collection('files')
    _initWatcher({ collection })
  })()
}