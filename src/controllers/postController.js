const postService = require("../services/postService");

const createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      poster: req.userId
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

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePostStatus
}; 