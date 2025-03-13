import {
  getPostsByFilter,
  getPostById,
  createPost,
  updatePost,
  getPostsByPosterId,
  // 添加 Prisma 方法
  getPostsByFilterWithPrisma,
  createPostWithPrisma,
  getPostByIdWithPrisma,
  updatePostWithPrisma,
  getPostsByPosterIdWithPrisma
} from "../../models/Post.js";
import loadEnv from "../../config/env.js";
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { PrismaClient } from '@prisma/client';

loadEnv();

const prisma = new PrismaClient();

// Helper function to map database enum values to GraphQL enum values
const mapCategoryToGraphQL = (category) => {
  const mapping = {
    'Living Room Furniture': 'LIVING_ROOM_FURNITURE',
    'Bedroom Furniture': 'BEDROOM_FURNITURE',
    'Dining Room Furniture': 'DINING_ROOM_FURNITURE',
    'Office Furniture': 'OFFICE_FURNITURE',
    'Outdoor Furniture': 'OUTDOOR_FURNITURE',
    'Storage': 'STORAGE',
    'Other': 'OTHER'
  };
  return mapping[category] || category;
};

const mapConditionToGraphQL = (condition) => {
  const mapping = {
    'Like New': 'LIKE_NEW',
    'Gently Used': 'GENTLY_USED',
    'Minor Scratches': 'MINOR_SCRATCHES',
    'Stains': 'STAINS',
    'Needs Repair': 'NEEDS_REPAIR'
  };
  return mapping[condition] || condition;
};

const mapDeliveryTypeToGraphQL = (deliveryType) => {
  const mapping = {
    'Home Delivery': 'HOME_DELIVERY',
    'Pickup': 'PICKUP',
    'Both': 'BOTH'
  };
  return mapping[deliveryType] || deliveryType;
};

const mapStatusToGraphQL = (status) => {
  const mapping = {
    'active': 'ACTIVE',
    'inactive': 'INACTIVE',
    'sold': 'SOLD',
    'deleted': 'DELETED'
  };
  return mapping[status] || status;
};

// Helper function to map GraphQL enum values to database enum values
const mapCategoryToDB = (category) => {
  const mapping = {
    'LIVING_ROOM_FURNITURE': 'Living Room Furniture',
    'BEDROOM_FURNITURE': 'Bedroom Furniture',
    'DINING_ROOM_FURNITURE': 'Dining Room Furniture',
    'OFFICE_FURNITURE': 'Office Furniture',
    'OUTDOOR_FURNITURE': 'Outdoor Furniture',
    'STORAGE': 'Storage',
    'OTHER': 'Other'
  };
  return mapping[category] || category;
};

const mapConditionToDB = (condition) => {
  const mapping = {
    'LIKE_NEW': 'Like New',
    'GENTLY_USED': 'Gently Used',
    'MINOR_SCRATCHES': 'Minor Scratches',
    'STAINS': 'Stains',
    'NEEDS_REPAIR': 'Needs Repair'
  };
  return mapping[condition] || condition;
};

const mapDeliveryTypeToDB = (deliveryType) => {
  const mapping = {
    'HOME_DELIVERY': 'Home Delivery',
    'PICKUP': 'Pickup',
    'BOTH': 'Both'
  };
  return mapping[deliveryType] || deliveryType;
};

const mapStatusToDB = (status) => {
  const mapping = {
    'ACTIVE': 'active',
    'INACTIVE': 'inactive',
    'SOLD': 'sold',
    'DELETED': 'deleted'
  };
  return mapping[status] || status;
};

// 格式化帖子数据（从数据库格式转换为GraphQL格式）
const formatPost = (post) => {
  if (!post) return null;

  return {
    id: post.id,
    category: mapCategoryToGraphQL(post.category),
    title: post.title,
    description: post.description,
    condition: mapConditionToGraphQL(post.condition),
    images: {
      FRONT: post.image_front,
      SIDE: post.image_side,
      BACK: post.image_back,
      DAMAGE: post.image_damage,
    },
    price: {
      amount: post.price_amount !== null ? parseFloat(post.price_amount).toFixed(2) : null,
      isFree: post.price_is_free,
      isNegotiable: post.price_is_negotiable,
    },
    deliveryType: mapDeliveryTypeToGraphQL(post.delivery_type),
    poster: {
      id: post.poster.id,
      firstName: post.poster.first_name,
      lastName: post.poster.last_name,
      avatar: post.poster.avatar,
      email: post.poster.email,
      phone: post.poster.phone,
      address: post.poster.address,
      createdAt: post.poster.created_at,
      updatedAt: post.poster.updated_at,
    },
    status: mapStatusToGraphQL(post.status),
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
};

// 格式化帖子输入（从GraphQL格式转换为数据库格式）
const formatPostInput = (input) => {
  const postData = {
    category: input.category,
    title: input.title,
    description: input.description,
    condition: input.condition,
    image_front: input.images.FRONT,
    image_side: input.images.SIDE || null,
    image_back: input.images.BACK || null,
    image_damage: input.images.DAMAGE || null,
    price_is_free: input.price.isFree,
    price_is_negotiable: input.price.isNegotiable,
    delivery_type: input.deliveryType,
    updated_at: new Date(),
  };

  // 处理价格
  if (input.price.isFree) {
    postData.price_amount = 0;
  } else if (input.price.amount) {
    // 使用 parseFloat 并保留两位小数
    postData.price_amount = parseFloat(parseFloat(input.price.amount).toFixed(2));
  }

  return postData;
};

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
  if (!input.images || !input.images.FRONT) {
    errors.push("At least one front image is required");
  }

  // 验证价格
  if (input.price.isFree) {
    // 如果是免费的，价格应该为0
    if (input.price.amount && parseFloat(input.price.amount) !== 0) {
      errors.push("The price of free items should be 0");
    }
  } else {
    // 如果不是免费的，价格应该大于0
    if (!input.price.amount || parseFloat(input.price.amount) <= 0) {
      errors.push("The price must be greater than 0");
    }
  }

  return errors;
};

const postResolvers = {
  Query: {
    // 获取所有帖子（支持过滤）
    getPostsByFilter: async (_, { filter = {} }) => {
      try {
        const { data: posts, error } = await getPostsByFilterWithPrisma(filter);

        if (error) {
          throw new Error(error.message);
        }

        // 格式化帖子数据
        const formattedPosts = posts.map((post) => formatPost(post));
        console.log("formattedPosts", formattedPosts);
        return {
          code: 0,
          msg: "Posts retrieved successfully",
          data: formattedPosts,
        };
      } catch (error) {
        console.error("获取帖子失败:", error);
        return {
          code: 1,
          msg: error.message,
          data: [],
        };
      }
    },

    // 获取单个帖子
    getPostById: async (_, { id }) => {
      try {
        const { data: post, error } = await getPostByIdWithPrisma(id);

        if (error) {
          throw new Error(error.message);
        }

        if (!post) {
          throw new Error("Post not found");
        }

        return {
          code: 0,
          msg: "Post retrieved successfully",
          data: formatPost(post),
        };
      } catch (error) {
        console.error("Failed to retrieve post:", error);
        return {
          code: 1,
          msg: error.message,
          data: null,
        };
      }
    },

    // 获取用户的帖子
    getPostsByPosterId: async (_, { posterId }) => {
      try {
        const { data: posts, error } = await getPostsByPosterIdWithPrisma(posterId);

        if (error) {
          throw new Error(error.message);
        }

        return {
          code: 0,
          msg: "User posts retrieved successfully",
          data: posts.map((post) => formatPost(post)),
        };
      } catch (error) {
        console.error("Failed to get user posts:", error);
        return {
          code: 1,
          msg: error.message,
          data: [],
        };
      }
    },

    // 获取当前用户的帖子
    getMyPosts: async (_, __, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error("Not logged in");
        }

        const userId = req.session.user.id;

        const { data: posts, error } = await getPostsByPosterIdWithPrisma(userId);

        if (error) {
          throw new Error(error.message);
        }

        return {
          code: 0,
          msg: "My posts retrieved successfully",
          data: posts.map((post) => formatPost(post)),
        };
      } catch (error) {
        console.error("Failed to get my posts:", error);
        return {
          code: 1,
          msg: error.message,
          data: [],
        };
      }
    },
  },

  Mutation: {
    // 创建帖子
    createPost: async (_, { input }, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error('Not logged in');
        }

        // 验证输入
        const validationErrors = validatePostInput(input);
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed: ${validationErrors.join("; ")}`);
        }

        // 格式化帖子数据
        const postData = formatPostInput(input);

        // 添加发布者ID和创建时间
        postData.poster_id = req.session.user.id;
        postData.created_at = new Date();
        postData.status = "active";

        const { data: post, error } = await createPostWithPrisma(postData);

        if (error) {
          throw new Error(error.message);
        }

        return {
          code: 0,
          msg: "Post created successfully",
          data: formatPost(post),
        };
      } catch (error) {
        console.error("Failed to create post:", error);
        return {
          code: 1,
          msg: error.message,
          data: null,
        };
      }
    },

    // 更新帖子
    updatePost: async (_, { id, input }, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error("Not logged in");
        }

        // 检查帖子是否存在并且属于当前用户
        const { data: existingPost, error: fetchError } = await getPostByIdWithPrisma(id);

        if (fetchError || !existingPost) {
          throw new Error("Post not found");
        }

        if (existingPost.poster_id !== req.session.user.id) {
          throw new Error("No permission to update this post");
        }

        if (existingPost.status === "deleted") {
          throw new Error("Deleted posts cannot be updated");
        }

        // 格式化更新数据
        const updateData = {};

        if (input.category) updateData.category = input.category;
        if (input.title) updateData.title = input.title;
        if (input.description)
          updateData.description = input.description;
        if (input.condition) updateData.condition = input.condition;
        if (input.deliveryType)
          updateData.delivery_type = input.deliveryType;
        if (input.status) updateData.status = input.status;

        // 处理图片
        if (input.images) {
          if (input.images.FRONT)
            updateData.image_front = input.images.FRONT;
          if ("SIDE" in input.images)
            updateData.image_side = input.images.SIDE;
          if ("BACK" in input.images)
            updateData.image_back = input.images.BACK;
          if ("DAMAGE" in input.images)
            updateData.image_damage = input.images.DAMAGE;
        }

        // 处理价格
        if (input.price) {
          if ("isFree" in input.price)
            updateData.price_is_free = input.price.isFree;
          if ("isNegotiable" in input.price)
            updateData.price_is_negotiable = input.price.isNegotiable;

          if (input.price.isFree) {
            updateData.price_amount = 0;
          } else if (input.price.amount) {
            // 使用 parseFloat 并保留两位小数
            updateData.price_amount = parseFloat(input.price.amount).toFixed(2);
          }
        }

        // 添加更新时间
        updateData.updated_at = new Date();

        // 更新帖子
        const { data: updatedPost, error: updateError } = await updatePostWithPrisma(
          id,
          updateData
        );

        if (updateError) {
          throw new Error(updateError.message);
        }

        return {
          code: 0,
          msg: "Post updated successfully",
          data: formatPost(updatedPost),
        };
      } catch (error) {
        console.error("Failed to update post:", error);
        return {
          code: 1,
          msg: error.message,
          data: null,
        };
      }
    },

    // 更新帖子状态
    updatePostStatus: async (_, { id, status }, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error("Not logged in");
        }

        // 检查帖子是否存在并且属于当前用户
        const { data: existingPost, error: fetchError } = await getPostByIdWithPrisma(id);

        if (fetchError || !existingPost) {
          throw new Error("Post not found");
        }

        if (existingPost.poster_id !== req.session.user.id) {
          throw new Error("No permission to update this post");
        }

        // 更新帖子状态
        const { data: updatedPost, error: updateError } = await updatePostWithPrisma(id, {
          status,
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        return {
          code: 0,
          msg: "Post status updated successfully",
          data: formatPost(updatedPost),
        };
      } catch (error) {
        console.error("Failed to update post status:", error);
        return {
          code: 1,
          msg: error.message,
          data: null,
        };
      }
    },

    // 删除帖子（实际上是将状态设置为deleted）
    deletePost: async (_, { id }, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error("Not logged in");
        }

        // 检查帖子是否存在并且属于当前用户
        const { data: existingPost, error: fetchError } = await getPostByIdWithPrisma(id);

        if (fetchError || !existingPost) {
          throw new Error("Post not found");
        }

        if (existingPost.poster_id !== req.session.user.id) {
          throw new Error("No permission to delete this post");
        }

        // 将帖子状态设置为deleted
        const { data: deletedPost, error: updateError } = await updatePostWithPrisma(id, {
          status: "deleted",
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        return {
          code: 0,
          msg: "Post deleted successfully",
          data: formatPost(deletedPost),
        };
      } catch (error) {
        console.error("删除帖子失败:", error);
        return {
          code: 1,
          msg: error.message,
          data: null,
        };
      }
    },
  },
};

export default postResolvers;
