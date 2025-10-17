const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Satellite = new Schema({
  url: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('satellite', Satellite);