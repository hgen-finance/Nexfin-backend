var mongoConnection = require('../db')

class CurrentModel {

  constructor(dbconn) {
    this.db = dbconn
    this.modelName = 'trove'
    this.pageCount = 10
    this.attributes = {
      user: {
        type: String,
        required: true
      },
      trove: {
        type: String,
        unique: true,
        required: true
      },
      amountSent: {
        type: String,
        unique: false,
      },
      teamFee: {
        type: String,
        unique: false,
      },
      depositorFee: {
        type: String,
        unique: false,
      },
      createdAt: Date,
    }

    const Schema = new this.db.Schema(this.attributes)

    Schema.pre('save', function () {
      if (this.isNew) {
        this.createdAt = new Date()
      }
    })

    this.model = this.db.model(this.modelName, Schema)
  }

  async getById(id) {
    return await this.model.findById(id)
    .lean()
    .exec()
  }

  async getByUser(address) {
    return await this.model.findOne({user: address.trim()})
    .lean()
    .exec()
  }

  async getByTrove(address) {
    return await this.model.findOne({trove: address.trim()})
    .lean()
    .exec()
  }

  async getByUserAndTrove(address, trove) {
    return await this.model.findOne(
      {
        user: address.trim(),
        trove: trove.trim()
      }
    )
    .lean()
    .exec()
  }

  async create(
    userAddress,
    troveAddress
  ) {
    troveAddress = troveAddress.trim()
    return await new this.model({
      user: userAddress,
      trove: troveAddress
    }).save()
    .then(doc => this.model.findById(doc._id)
      .lean()
      .exec()
    )
  };

  async findOrCreateByAddress(address, trove) {
    address = address.trim()
    const exist = await this.getByUserAndTrove(address, trove)

    if (exist) {
      return exist
    }

    return await this.create(address, trove)
  }

  async getList(page, query) {
    let skip = (page - 1) * this.pageCount
    const filter = {}

    if (query) {
      filter.trove = { $regex: '.*' + query + '.*' }
    }

    const qb = this.model.find(filter).lean()
    const total_count = await this.model.count(filter)

    if (page > 0) {
      qb.limit(this.pageCount).skip(skip)
    }

    const entities = await qb.exec()

    return {
      entities,
      total_count,
    }
  };

  getAll(query) {
    const filter = {}

    if (query) {
      filter.trove = { $regex: '.*' + query + '.*' }
    }

    return this.model.find(filter).sort({ createdAt: -1 }).lean().exec()
  }

}

module.exports = new CurrentModel(mongoConnection)