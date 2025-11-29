const mongoose = require('mongoose')
const schema = mongoose.Schema
const Category = new schema({
  name: { type: String, required: true },
})
module.exports = mongoose.model('category', Category)