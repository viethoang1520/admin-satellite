const Post = require("../models/Post");
const Satellite = require("../models/Satellite");
const { generateVariations } = require("../../utils/postUtils");
const getQueue = require("../../config/queue/pqueue");
const { postToSatellite } = require("../../apis/post");
const satelliteApis = require("../../data/satelliteApis");

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
    const numberOfApis = await Satellite.countDocuments();
    const post = await Post.findOne({
      title: postTitle,
    }).sort({ createdAt: -1 });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.totalSatellite || isNaN(post.totalSatellite)) {
      return res.status(400).json({ message: "Post progress not found" });
    }
    const progress = (post.totalSatellite / numberOfApis).toFixed(2);
    console.log("Progress:", progress);
    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json(error);
  }
};
const createNewPost = async (req, res) => {
  try {
    console.log(JSON.stringify(req.body, null, 2));

    const { values, storeImg } = req.body;
    const { title, content, link } = values;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newPost = new Post({
      title,
      content,
      originalLink: link,
    });
    await newPost.save();

    const urls = await pushToSatelliteWebsite(newPost, storeImg);

    if (urls.length === 0) {
      return res.status(500).json({ message: "Failed to push to satellite websites" });
    }

    return res.status(201).json({ newPost, urls });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

function replaceImageLinks(content, baseUrlOld, baseUrlNew) {
  if (!content) return content;
  const regex = new RegExp(baseUrlOld.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  return content.replace(regex, baseUrlNew);
}

const pushToSatelliteWebsite = async (newPost, storeImg) => {
  try {
    const satellites = await Satellite.find();
    if (!satellites.length) {
      console.warn("⚠️ No satellite sites found in DB.");
      return [];
    }

    const queue = getQueue();
    const satelliteUrls = [];
    let progress = 0;

    queue.on("completed", async (result) => {
      if (result?.data?.link) satelliteUrls.push(result.data.link);
      progress += 1;
      await Post.findOneAndUpdate({ _id: newPost._id }, { totalSatellite: progress });
    });

    for (const satellite of satellites) {
      const siteMatch = Object.values(storeImg).find((site) =>
        satellite.url.includes(new URL(site.baseUrl).hostname)
      );

      if (!siteMatch) {
        console.log(`⚠️ Không tìm thấy site tương ứng cho ${satellite.url}`);
        continue;
      }

      let newContent = newPost.content;
      newContent = replaceImageLinks(newContent, siteMatch.baseUrl, satellite.url);


      const post = {
        title: newPost.title,
        content: newContent,
        status: "publish",
      };

      queue.add(async () => {
        const res = await postToSatellite(satellite, post);
        return res;
      });
    }

    await queue.onIdle();
    return satelliteUrls;
  } catch (error) {
    console.error("pushToSatelliteWebsite error:", error);
    return [];
  }
};


module.exports = {
  getAllPosts,
  trackProgress,
  createNewPost,
  pushToSatelliteWebsite,
};
