var mongoConnection = require('../db');

class CurrentModel {

  constructor(dbconn) {
    this.db = dbconn;
    this.modelName = 'trove';
    this.pageCount = 10;
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
    };
    this.model = this.db.model(this.modelName, new this.db.Schema(this.attributes));
  }

  async getById(id) {
    return await this.model.findById(id)
      .lean()
      .populate('roles')
      .populate('avatar', '-__v')
      .populate('referal_promocode', '-__v')
      .exec();
  }

  async getByUser(address) {
    return await this.model.findOne({user: address.trim().toLowerCase()})
      .lean()
      .populate('roles')
      .populate('avatar', '-__v')
      .populate('referal_promocode', '-__v')
      .exec();
  }

  async getByTrove(address) {
    return await this.model.findOne({trove: address.trim().toLowerCase()})
      .lean()
      .populate('roles')
      .populate('avatar', '-__v')
      .populate('referal_promocode', '-__v')
      .exec();
  }

  async getByUserAndTrove(address, trove) {
    return await this.model.findOne(
      {user: address.trim().toLowerCase(),
        trove: trove.trim().toLowerCase()}
    )
      .lean()
      .populate('roles')
      .populate('avatar', '-__v')
      .populate('referal_promocode', '-__v')
      .exec();
  }

  async create(
    userAddress,
    troveAddress
  ) {
    troveAddress = troveAddress.trim().toLowerCase();
    return await new this.model({
      userAddress,
      troveAddress
    }).save()
      .then(doc => this.model.findById(doc._id)
        .lean()
        .populate('roles')
        .populate('referal_promocode')
        .populate('avatar')
        .exec()
      );
  };

  async findOrCreateByAddress(address, trove) {
    address = address.trim().toLowerCase();
    const exist = await this.getByUserAndTrove(address, trove)

    if (exist) {
      return exist
    }

    return await this.create(address, trove);
  }

  async getList(page) {
    let skip = (page - 1) * this.pageCount;
    let count = await this.model.countDocuments();
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
        .exec();

    return {
      entities: list,
      total_count: count
    };
  };

}

module.exports = new CurrentModel(mongoConnection);