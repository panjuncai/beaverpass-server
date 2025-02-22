const Post = require("../models/Post");

const createPost = async (postData) => {
  try {
    // 验证必填字段
    if (!postData.title || !postData.description || !postData.category || 
        !postData.condition || !postData.images.FRONT) {
      throw new Error('Missing required fields');
    }

    // 验证描述长度
    if (postData.description.length > 500) {
      throw new Error('Description exceeds maximum length');
    }

    // 处理价格
    const processedPostData = {
      ...postData,
      price: {
        ...postData.price,
        amount: postData.price.isFree ? "0" : postData.price.amount
      }
    };

    const post = new Post(processedPostData);
    await post.save();
    return post;
  } catch (e) {
    throw e;
  }
};

const getAllPosts = async (filters) => {
  try {
    const { category, condition, priceRange } = filters;
    const query = { status: {$ne:'deleted'} };

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      query['price.amount'] = { $gte: min, $lte: max };
    }

    const posts = await Post.find(query)
      .populate('poster', 'username')
      .sort({ createdAt: -1 });

    if (!posts) {
      throw new Error('No posts found');
    }

    return posts;
  } catch (e) {
    throw e;
  }
};

const getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId)
      .populate('poster', 'username');

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  } catch (e) {
    throw e;
  }
};

const updatePostStatus = async (postId, status, userId) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.poster.toString() !== userId.toString()) {
      throw new Error('Not authorized');
    }

    post.status = status;
    await post.save();
    return post;
  } catch (e) {
    throw e;
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePostStatus
}; 