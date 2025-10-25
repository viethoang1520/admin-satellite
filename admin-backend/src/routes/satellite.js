const express = require('express')
const router = express.Router()
const {
  addSatellite,
  getNumberOfPublishedPosts,
  getNumberOfErrorPosts,
  getOverallProgress
} = require('../app/controllers/satelliteController')

router.post('/', addSatellite)
router.get('/published-posts', getNumberOfPublishedPosts)
router.get('/error-posts', getNumberOfErrorPosts)
router.get('/overall-progress', getOverallProgress)

module.exports = router