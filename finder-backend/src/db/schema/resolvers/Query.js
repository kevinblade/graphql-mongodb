module.exports = {
  books: async (_, args, { collections: files }) =>
    await files.find({}).toArray(),
  findBooks: async (_, args, { collections: files }) =>
    await files
      .aggregate([
        {
          $match: { name: new RegExp(`.*${args.name}.*`, 'gi') }
        },
        {
          $lookup: {
            from: 'files',
            let: {
              id: '$_id',
              name: '$name',
              size: '$size'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $ne: ['$_id', '$$id']
                      },
                      {
                        $eq: ['$name', '$$name']
                      },
                      {
                        $eq: ['$size', '$$size']
                      }
                    ]
                  }
                }
              }
            ],
            as: 'dup_files'
          }
        },
        {
          $match: { $expr: { $gte: [{ $size: '$dup_files' }, 0] } }
        },
        {
          $project: {
            path: 1,
            name: 1,
            size: 1,
            'dup_files.path': 1,
            'dup_files.name': 1,
            'dup_files.size': 1
          }
        },
        {
          $facet: {
            books: [
              { $skip: args.page - 1 },
              { $limit: args.size },
            ],
            pageInfo: [
              { $group: { _id: null, count: { $sum: 1 } } },
            ],
          }
        },
        {
          $unwind: '$pageInfo'
        }
      ])
      .toArray()
}
