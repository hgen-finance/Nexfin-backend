const mongoConnection = require('../db')

class CurrentModel {

  constructor(dbconn) {
    this.db = dbconn
    this.modelName = 'deposit'
    this.pageCount = 10
    this.attributes = {
      user: {
        type: String,
        required: true
      },
      deposit: {
        type: String,
        unique: true,
        required: true
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
    .populate('roles')
    .populate('avatar', '-__v')
    .populate('referal_promocode', '-__v')
    .exec()
  }

  async getByUser(address) {
    return await this.model.findOne({user: address.trim()})
    .lean()
    .exec()
  }

  async getByDeposit(address) {
    return await this.model.findOne({deposit: address.trim()})
    .lean()
    .exec()
  }

  async getByUserAndDeposit(address, deposit) {
    return await this.model.findOne(
      {
        user: address.trim(),
        deposit: deposit.trim()
      }
    )
    .lean()
    .exec()
  }

  async create(
    userAddress,
    depositAddress
  ) {
    depositAddress = depositAddress.trim()
    return await new this.model({
      user: userAddress,
      deposit: depositAddress
    }).save()
    .then(doc => this.model.findById(doc._id)
      .lean()
      .exec()
    )
  };

  async findOrCreateByAddress(address, deposit) {
    address = address.trim()
    const exist = await this.getByUserAndDeposit(address, deposit)

    if (exist) {
      return exist
    }

    return await this.create(address, deposit)
  }

  async getList(page, query) {
    let skip = (page - 1) * this.pageCount
    const filter = {}

    if (query) {
      filter.deposit = { $regex: '.*' + query + '.*' }
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
      filter.deposit = { $regex: '.*' + query + '.*' }
    }

    return this.model.find(filter).sort({ createdAt: -1 }).lean().exec()
  }

}

module.exports = new CurrentModel(mongoConnection)