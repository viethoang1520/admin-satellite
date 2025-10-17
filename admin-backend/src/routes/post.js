const express = require('express')
const router = express.Router()
const { getAllPosts, createNewPost, trackProgress } = require('../app/controllers/postController')

router.get('/', getAllPosts)
router.post('/', createNewPost)
router.get('/track-progress', trackProgress)

module.exports = router