const express = require('express')
const router = express.Router()
const {
  getAllPosts,
  createNewPost,
  trackProgress,
  repostToErrorSatellitesOnePost,
  getPostById
} = require('../app/controllers/postController')

router.get('/', getAllPosts)
router.get('/:id', getPostById)
router.post('/', createNewPost)
router.post('/repost', repostToErrorSatellitesOnePost)
router.get('/track-progress', trackProgress)

module.exports = router