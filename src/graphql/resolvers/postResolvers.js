// 验证帖子输入
const validatePostInput = (input) => {
  const errors = [];

  // 验证标题
  if (!input.title || input.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (input.title.length > 100) {
    errors.push("Title must be less than 100 characters");
  }

  // 验证描述
  if (!input.description || input.description.trim().length === 0) {
    errors.push("Description is required");
  } else if (input.description.length > 500) {
    errors.push("Description must be less than 500 characters");
  }

  // 验证图片
  if (!input.images) {
    errors.push("At least one image is required");
  }

  // 验证价格
  if (input.amount < 0) {
    errors.push("The price must be greater than 0");
  }

  return errors;
};

const postResolvers = {
  Query: {
    // 获取所有帖子（支持过滤）
    getPostsByFilter: async (_, { filter = {} }, { models }) => {
      try {
        const posts = await models.post.getPostsByFilter(filter);

        return posts;
      } catch (error) {
        console.error("获取帖子失败:", error);
        throw new Error(error.message);
      }
    },

    // 获取单个帖子
    getPostById: async (_, { id }, { models }) => {
      try {
        if(!id){
          return null;
        }
        
        const post = await models.post.getPostById(id);

        if (!post) {
          throw new Error("Post not found");
        }

        return post;
      } catch (error) {
        console.error("Failed to retrieve post:", error);
        throw new Error(error.message);
      }
    },

    // 获取用户的帖子
    getPostsByPosterId: async (_, { posterId }, { prisma }) => {
      try {
        const posts = await prisma.post.findMany({
          where: { posterId },
          include: {
            poster: true,
            images: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return posts;
      } catch (error) {
        console.error("Failed to get user posts:", error);
        throw new Error(error.message);
      }
    },

    // 获取当前用户的帖子
    getMyPosts: async (_, __, { user, prisma }) => {
      try {
        // 检查用户是否已登录
        if (!user) {
          throw new Error("Not logged in");
        }

        const posts = await prisma.post.findMany({
          where: { posterId: user.id },
          include: {
            poster: true,
            images: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return posts;
      } catch (error) {
        console.error("Failed to get my posts:", error);
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    // 创建帖子
    createPost: async (_, { input }, { user, models }) => {
      try {
        // 检查用户是否已登录
        if (!user) {
          throw new Error('Not logged in');
        }

        // 验证输入
        const validationErrors = validatePostInput(input);
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed: ${validationErrors.join("; ")}`);
        }

        const post = await models.post.createPost(input, user.id);
        return post;
      } catch (error) {
        console.error("Failed to create post:", error);
        throw new Error(error.message);
      }
    },

    // 更新帖子
    updatePost: async (_, { id, input }, { user, models }) => {
      try {
        // 检查用户是否已登录
        if (!user) {
          throw new Error("Not logged in");
        }

        // 检查帖子是否存在并且属于当前用户
        const existingPost = await models.post.getPostById(id);

        if (!existingPost) {
          throw new Error("Post not found");
        }

        if (existingPost.posterId !== user.id) {
          throw new Error("No permission to update this post");
        }

        if (existingPost.status === "DELETED") {
          throw new Error("Deleted posts cannot be updated");
        }

        // 准备更新数据
        //const updateData = [...input]
        
        // if (input.category) updateData.category = input.category;
        // if (input.title) updateData.title = input.title;
        // if (input.description) updateData.description = input.description;
        // if (input.condition) updateData.condition = input.condition;
        // if (input.deliveryType) updateData.deliveryType = input.deliveryType;
        // if (input.status) updateData.status = input.status;
        // if(input.isNegotiable) updateData.isNegotiable = input.isNegotiable;
        // if(input.amount) updateData.amount = input.amount;
        // if(input.images) updateData.images = input.images;


        // 更新帖子
        const post = await models.post.updatePost(id, input);
        return post;
      } catch (error) {
        console.error("Failed to update post:", error);
        throw new Error(error.message);
      }
    },

    // 更新帖子状态
    updatePostStatus: async (_, { id, status }, { user, models }) => {
      try {
        // 检查用户是否已登录
        if (!user) {
          throw new Error("Not logged in");
        }

        // 检查帖子是否存在并且属于当前用户
        const existingPost = await models.post.getPostById(id);

        if (!existingPost) {
          throw new Error("Post not found");
        }

        if (existingPost.posterId !== user.id) {
          throw new Error("No permission to update this post");
        }

        // 更新帖子状态
        const post = await models.post.updatePostStatus(id, status);
        return post;
      } catch (error) {
        console.error("Failed to update post status:", error);
        throw new Error(error.message);
      }
    },

    // 删除帖子（实际上是将状态设置为DELETED）
    deletePost: async (_, { id }, { user, models }) => {
      try {
        // 检查用户是否已登录
        if (!user) {
          throw new Error("Not logged in");
        }

        // 检查帖子是否存在并且属于当前用户
        const existingPost = await models.post.getPostById(id);

        if (!existingPost) {
          throw new Error("Post not found");
        }

        if (existingPost.posterId !== user.id) {
          throw new Error("No permission to delete this post");
        }

        // 将帖子状态设置为DELETED
        const post = await models.post.updatePostStatus(id, "DELETED");
        return post;
      } catch (error) {
        console.error("Failed to delete post:", error);
        throw new Error(error.message);
      }
    },
  },
};

export default postResolvers;
