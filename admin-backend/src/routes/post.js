const express = require('express')
const router = express.Router()
const {
  getAllPosts,
  createNewPost,
  trackProgress,
  repostToErrorSatellitesOnePost,
  getPostById
} = require('../app/controllers/postController')
const upload = require('../config/file/upload')

router.get('/', getAllPosts)
router.get('/:id', getPostById)
router.post('/', upload.array("images", 10), createNewPost)
router.post('/repost', repostToErrorSatellitesOnePost)
router.get('/track-progress', trackProgress)

module.exports = router