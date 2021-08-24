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
    }
    this.model = this.db.model(this.modelName, new this.db.Schema(this.attributes))
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
    .populate('roles')
    .populate('avatar', '-__v')
    .populate('referal_promocode', '-__v')
    .exec()
  }

  async getByDeposit(address) {
    return await this.model.findOne({deposit: address.trim()})
    .lean()
    .populate('roles')
    .populate('avatar', '-__v')
    .populate('referal_promocode', '-__v')
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
    .populate('roles')
    .populate('avatar', '-__v')
    .populate('referal_promocode', '-__v')
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
      .populate('roles')
      .populate('referal_promocode')
      .populate('avatar')
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

  async getList(page) {
    let skip = (page - 1) * this.pageCount
    let count = await this.model.countDocuments()
    let list = page == 0 ?
      await this.model
      .find()
      .populate('roles')
      .populate('referal_promocode', '-__v')
      .populate('avatar', '-__v')
      .lean()
      .exec() :
      await this.model
      .find()
      .populate('roles')
      .populate('referal_promocode', '-__v')
      .populate('avatar', '-__v')
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