// require('dotenv').config()
const mongoose = require("mongoose");

//TODO: Add the URI of mongodb to env
mongoose
  .connect("mongodb://mongo-nexfin:27017/data", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

module.exports = mongoose;
