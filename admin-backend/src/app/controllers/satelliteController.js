const Satellite = require("../models/Satellite");
const Post = require("../models/Post");



// DONE: Add a new satellite
const addSatellite = (req, res) => {
  try {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    const { url, username, password } = req.body;
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }
    const newSatellite = new Satellite({ url, username, password });
    newSatellite
      .save()
      .then((satellite) => res.status(201).json({ satellite }))
      .catch((error) => res.status(500).json({ error }));
  } catch (error) {
    res.status(500).json({ error });
  }
};

// DONE: Get number of published posts across all satellites
const getNumberOfPublishedPosts = async (req, res) => {
  try {
    const result = await Post.aggregate([
      {
        $unwind: '$postedSatellite'
      },
      {
        $group: {
          _id: null,
          totalLength: { $sum: 1 }
        }
      }
    ]);
    if (result.length <= 0) {
      return res.json({ success: false, message: 'No published posts found.' });
    }
    return res.json({ success: true, totalPublishedPosts: result[0]?.totalLength || 0 });
  } catch (error) {
    console.error("Error counting published posts:", error);
    res.status(500).json({ error });
  }
}

// DONE: Get number of published posts across all satellites
const getNumberOfErrorPosts = async (req, res) => {
  try {
    const result = await Post.aggregate([
      {
        $unwind: '$errorSatellite'
      },
      {
        $group: {
          _id: null,
          totalLength: { $sum: 1 }
        }
      }
    ]);
    if (result.length <= 0) {
      return res.json({ success: false, message: 'No error posts found.' });
    }
    return res.json({ success: true, totalErrorPosts: result[0]?.totalLength || 0 });
  } catch (error) {
    console.error("Error counting error posts:", error);
    res.status(500).json({ error });
  }
}

const getOverallProgress = async (req, res) => {
  try {
    const posts = await Post.find({ successfulRate: { $ne: 0 } });
    const total = posts.reduce((sum, p) => sum + p.successfulRate, 0);
    const average = total / posts.length;
    if (isNaN(average)) {
      return res.status(200).json({ success: true, averageSuccessfulRate: 0 });
    }
    res.status(200).json({ success: true, averageSuccessfulRate: average });
  } catch (error) {
    res.status(500).json({ error });
  }
}

module.exports = {
  addSatellite,
  getNumberOfPublishedPosts,
  getNumberOfErrorPosts,
  getOverallProgress
};