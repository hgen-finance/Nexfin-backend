var mongoose = require('mongoose');
var config = require('./config');

let connectString = `mongodb://${config.user}:${config.password}@${config.host}/${config.dbname}`;

mongoose.connect(connectString,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true);

module.exports = mongoose;