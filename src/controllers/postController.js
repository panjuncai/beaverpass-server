const postService = require("../services/postService");

const createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      poster: req.user._id
    };
    console.log(postData);
    const post = await postService.createPost(postData);
    res.status(201).json({ code: 0, msg: "Post created successfully", data: post });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await postService.getAllPosts(req.query);
    res.status(200).json({ code: 0, msg: "Posts found", data: posts });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.status(200).json({ code: 0, msg: "Post found", data: post });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

const updatePostStatus = async (req, res) => {
  try {
    const post = await postService.updatePostStatus(req.params.id, req.body.status, req.user._id);
    res.status(200).json({ code: 0, msg: "Post status updated", data: post });
  } catch (e) {
    res.status(400).json({ code: 1, msg: e.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    // req.user 来自 auth 中间件
    const posts = await postService.getPostsByUserId(req.user._id);
    res.status(200).json({
      code: 0,
      msg: "Get my posts successfully",
      data: posts
    });
  } catch (error) {
    res.status(400).json({
      code: 1,
      msg: error.message
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePostStatus,
  getMyPosts
}; 