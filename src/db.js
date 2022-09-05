const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async () => {
  try {
    mongoose
    .connect(process.env.MONGO_URITEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.log('ERR: Connect to MongoDB');
  }
}