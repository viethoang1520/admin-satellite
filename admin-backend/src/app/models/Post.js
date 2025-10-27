const mongoose = require('mongoose')

const ErrorSatellite = new mongoose.Schema({
  url: { type: String, required: true },
  errorCode: { type: Number, required: true },
})

const Post = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  totalSatellite: {
    type: Number,
    required: false
  },
  postedSatellite: {
    type: [String],
    required: false
  },
  errorSatellite: {
    type: [ErrorSatellite],
    required: false
  },
  successfulRate: {
    type: Number,
    required: false,
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('post', Post)