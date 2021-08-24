var mongoConnection = require('../db')

class CurrentModel {

  constructor(dbconn) {
    this.db = dbconn
    this.modelName = 'notification'
    this.pageCount = 10
    this.attributes = {
      user: {
        type: String,
        required: true
      },
      email: {
        type: String,
        unique: true,
        required: true
      },
    }
    this.model = this.db.model(this.modelName, new this.db.Schema(this.attributes))
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
    user,
    email
  ) {
    return await new this.model({
      user,
      email
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

  async getList(page) {
    let skip = (page - 1) * this.pageCount
    let count = await this.model.countDocuments()
    let list = page == 0 ?
      await this.model
      .find()
      .lean()
      .exec() :
      await this.model
      .find()
      .lean()
      .limit(this.pageCount)
      .skip(skip)
      .exec()

    return {
      entities: list,
      total_count: count
    }
  };

}

module.exports = new CurrentModel(mongoConnection)