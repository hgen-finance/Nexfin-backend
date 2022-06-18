var mongoConnection = require('../db')

class CurrentModel {

  constructor(dbconn) {
    this.db = dbconn
    this.modelName = 'subscriber'
    this.pageCount = 10
    this.attributes = {
      email: {
        type: String,
        unique: true,
        required: true
      },
      createdAt: {
        type: Date,
      },
    }

    this.model = this.db.model(this.modelName, new this.db.Schema(this.attributes))
  }

  async getById (id) {
    return await this.model.findById(id)
      .lean()
      .exec()
  }

  async getByEmail (email) {
    return await this.model.findOne({ email })
      .lean()
      .exec()
  }

  async create (email) {
    return await new this.model({
      email,
      createdAt: new Date(),
    }).save()
      .then(doc => this.model.findById(doc._id)
        .lean()
        .exec()
      )
  }

  async findOrCreateByEmail (email) {
    const exist = await this.getByEmail(email)

    if (exist) {
      return exist
    }

    return await this.create(email)
  }

  async getAll () {
    return await this.model
      .find()
      .lean()
      .exec()
  }
}

module.exports = new CurrentModel(mongoConnection)