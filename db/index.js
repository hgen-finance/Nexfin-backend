require('dotenv').config()
const mongoose = require("mongoose");

//TODO: Add the URI of mongodb to env for testing
mongoose
    .connect(`mongodb+srv://root:${process.env.DB_PASSWORD}@transaction-log-devnet.o4s3r.mongodb.net/?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

module.exports = mongoose;
