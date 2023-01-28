const mongoose = require('mongoose');
require('dotenv').config();
mongoose.set('strictQuery', true);

module.exports = async () => {
  try {
    mongoose
    .connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.log('ERR: Connect to MongoDB');
  }
}