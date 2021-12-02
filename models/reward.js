var mongoConnection = require('../db')

class CurrentModel {

  constructor(dbconn) {
    this.db = dbconn
    this.modelName = 'reward'
    this.pageCount = 10
    this.attributes = {
      coin: {
        type: String,
        required: true
      },
      governance: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        required: true,
        unique: true
      },
      depositors: {
        type: Number,
        required: true
      },
      deposit: {
        type: Number,
        required: true
      }
    }
    this.model = this.db.model(this.modelName, new this.db.Schema(this.attributes))
  }

  async getById(id) {
    return await this.model.findById(id)
    .lean()
    .exec()
  }

  async create(
    {
      coin,
      governance,
      token
    },
    {
      date
    },
    {
      depositors,
      deposit
    }
  ) {
    return await new this.model({
      coin,
      governance,
      token,
      date,
      depositors,
      deposit
    })
    .save()
    .then(doc => this.model.findById(doc._id)
      .lean()
      .exec()
    )
  };
}

module.exports = new CurrentModel(mongoConnection)