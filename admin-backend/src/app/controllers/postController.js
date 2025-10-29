const Post = require("../models/Post");
const Satellite = require("../models/Satellite");
const getQueue = require("../../config/queue/pqueue");
const { postToSatellite } = require("../../apis/post");
const { convertErrorSatelliteToUrls } = require("../../utils/satelliteUtils");

const getAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.find();
    return res.json({ allPosts });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const trackProgress = async (req, res) => {
  try {
    const { postTitle } = req.query;
    if (!postTitle) {
      return res.status(400).json({ message: "Post title is required" });
    }
    const post = await Post.findOne({
      title: postTitle,
    }).sort({ createdAt: -1 });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.totalSatellite || isNaN(post.totalSatellite)) {
      return res.status(400).json({ message: "Post progress not found" });
    }
    const numberOfApis = post.totalSatellite;
    const successfulPosts = post.postedSatellite
      ? post.postedSatellite.length
      : 0;
    const progress = (successfulPosts / numberOfApis).toFixed(2);
    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json(error);
  }
};
const createNewPost = async (req, res) => {
  try {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    const { values, storeImg } = req.body;
    const { title, content } = values;
    const totalSatellite = await Satellite.countDocuments();
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const newPost = new Post({
      title,
      content,
      totalSatellite,
    });
    await newPost.save();

    const { successfulSatelliteUrls, progress } = await pushToSatelliteWebsite(
      newPost,
      storeImg
    );
    // if (successfulSatelliteUrls.length === 0) {
    //   return res
    //     .status(500)
    //     .json({ message: "Failed to push to satellite websites" });
    // }
    const successfulRate = progress / totalSatellite;
    await Post.findByIdAndUpdate(
      newPost._id,
      { successfulRate },
      { new: true }
    );
    const post = await Post.findById(newPost._id);
    const updatedPost = await convertErrorSatelliteToUrls(post);
    return res.status(201).json({ newPost: updatedPost, successfulSatelliteUrls });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

function replaceImageLinks(content, baseUrlOld, baseUrlNew) {
  if (!content) return content;
  const regex = new RegExp(
    baseUrlOld.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "g"
  );
  return content.replace(regex, baseUrlNew);
}

const pushToSatelliteWebsite = async (newPost, storeImg, progress = 0) => {
  console.log("newPost: ", newPost)
  console.log("storeImg: ", storeImg)
  try {
    const satellites = await Satellite.find();
    if (!satellites.length) {
      console.warn("⚠️ No satellite sites found in DB.");
      return [];
    }

    const queue = getQueue();
    const successfulSatelliteUrls = [];

    queue.on("completed", async (result) => {
      if (result?.data?.link) {
        successfulSatelliteUrls.push(result.data.link);
        progress += 1;
      }
      if (successfulSatelliteUrls.length !== 0) {
        await Post.findOneAndUpdate(
          { _id: newPost._id },
          { postedSatellite: successfulSatelliteUrls }
        );
      }
    });

    queue.on("error", async (error) => {
      console.log("Task failed:", error);
    });

    for (const satellite of satellites) {
      const siteMatch = Object.values(storeImg).find((site) =>
        satellite.url.includes(new URL(site.url))
      );

      if (!siteMatch) {
        console.log(`⚠️ Không tìm thấy site tương ứng cho ${satellite.url}`);
        await Post.findByIdAndUpdate(
          newPost._id,
          { $addToSet: { errorSatellite: { satelliteId: satellite._id, errorCode: 404 } } },
          { new: true }
        );
        continue;
      }

      let newContent = newPost.content;
      newContent = replaceImageLinks(newContent, siteMatch.url, satellite.url);

      const post = {
        title: newPost.title,
        content: newContent,
        status: "publish",
      };

      queue.add(async () => {
        try {
          const res = await postToSatellite(satellite, post);
          return res;
        } catch (error) {
          await Post.findByIdAndUpdate(
            newPost._id,
            {
              $addToSet: {  
                errorSatellite: {
                  satelliteId: satellite._id,
                  errorCode: error?.status || 500
                }
              }
            },
            { new: true }
          );
        }
      });
    }

    await queue.onIdle();
    queue.clear();
    queue.removeAllListeners();
    return { successfulSatelliteUrls, progress };
  } catch (error) {
    return [];
  }
};

const repostToErrorSatellitesOnePost = async (req, res) => { 
  try {
    const {storeImg} = req.body
    const existingPost = await Post.findById(req.params.id)
      .populate('errorSatellite.satelliteId');
    const { successfulRate, totalSatellite } = existingPost;
    const existingProgress = Math.round(successfulRate * totalSatellite);
    const { successfulSatelliteUrls, progress } = await pushToSatelliteWebsite(
      existingPost,
      storeImg,
      existingProgress
    );

    const errorSatellites = existingPost.errorSatellite.filter(err => {
      return !successfulSatelliteUrls.includes(err.satelliteId.url.toString());
    });
    existingPost.errorSatellite = errorSatellites;
    const updatedPosts = await existingPost.save();
  
    const newSuccessfulRate = progress / totalSatellite;
    await Post.findByIdAndUpdate(
      existingPost._id,
      { successfulRate: newSuccessfulRate },
      { new: true }
    );
    return res.status(200).json({ message: "Posts updated successfully", updatedPosts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    returnedPost = await convertErrorSatelliteToUrls(post);
    res.status(200).json({ post: returnedPost });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  trackProgress,
  createNewPost,
  pushToSatelliteWebsite,
  repostToErrorSatellitesOnePost
};
