// require('dotenv').config()
const mongoose = require('mongoose')

// mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
// mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})

mongoose.connect('mongodb+srv://pree:wnSN3FbRVG9EUZR@cluster0.rxxqd.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true});
module.exports = mongoose

