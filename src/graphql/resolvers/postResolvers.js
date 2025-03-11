import { 
  getPostsByFilter, 
  getPostById, 
  createPost, 
  updatePost, 
  getPostsByPosterId,
  // 添加 Prisma 方法
  getPostsByFilterWithPrisma,
  createPostWithPrisma
} from '../../models/Post.js';
import loadEnv from '../../config/env.js';
import { categoryMap, conditionMap, deliveryTypeMap } from './index.js';

loadEnv();
// 是否使用 Prisma（可以通过环境变量控制）
const USE_PRISMA = process.env.USE_PRISMA === 'true';

// 处理枚举值映射
const mapEnumValues = (input) => {
  if (!input) return input;
  
  const result = { ...input };
  
  // 处理 category
  if (input.category && categoryMap[input.category]) {
    result.category = categoryMap[input.category];
  }
  
  // 处理 condition
  if (input.condition && conditionMap[input.condition]) {
    result.condition = conditionMap[input.condition];
  }
  
  // 处理 deliveryType
  if (input.deliveryType && deliveryTypeMap[input.deliveryType]) {
    result.deliveryType = deliveryTypeMap[input.deliveryType];
  }
  
  return result;
};

// 格式化帖子数据（从数据库格式转换为GraphQL格式）
const formatPost = (post) => {
  if (!post) return null;
  
  return {
    id: post.id,
    category: post.category,
    title: post.title,
    description: post.description,
    condition: post.condition,
    images: {
      FRONT: post.image_front,
      SIDE: post.image_side,
      BACK: post.image_back,
      DAMAGE: post.image_damage
    },
    price: {
      amount: post.price_amount?.toFixed(2),
      isFree: post.price_is_free,
      isNegotiable: post.price_is_negotiable
    },
    deliveryType: post.delivery_type,
    poster: {
      id: post.poster.id,
      firstName: post.poster.first_name,
      lastName: post.poster.last_name,
      avatar: post.poster.avatar,
      email: post.poster.email,
      phone: post.poster.phone,
      address: post.poster.address,
      createdAt: post.poster.created_at,
      updatedAt: post.poster.updated_at
    },
    status: post.status,
    createdAt: post.created_at,
    updatedAt: post.updated_at
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
    updated_at: new Date()
  };

  // 处理价格
  if (input.price.isFree) {
    postData.price_amount = 0;
  } else if (input.price.amount) {
    postData.price_amount = input.price.amount;
  }

  return postData;
};

// 验证帖子输入
const validatePostInput = (input) => {
  const errors = [];
  
  // 验证标题
  if (!input.title || input.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (input.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  // 验证描述
  if (!input.description || input.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (input.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }
  
  // 验证图片
  if (!input.images || !input.images.FRONT) {
    errors.push('At least one front image is required');
  }
  
  // 验证价格
  if (input.price.isFree) {
    // 如果是免费的，价格应该为0
    if (input.price.amount && parseFloat(input.price.amount) !== 0) {
      errors.push('The price of free items should be 0');
    }
  } else {
    // 如果不是免费的，价格应该大于0
    if (!input.price.amount || parseFloat(input.price.amount) <= 0) {
      errors.push('The price must be greater than 0');
    }
  }
  
  return errors;
};

const postResolvers = {
  Query: {
    // 获取所有帖子（支持过滤）
    getPostsByFilter: async (_, { filter = {} }) => {
      try {
        // 处理枚举值映射
        const mappedFilter = mapEnumValues(filter);
        
        // 根据配置选择使用 Prisma 或 Supabase
        const { data: posts, error } = USE_PRISMA 
          ? await getPostsByFilterWithPrisma(mappedFilter)
          : await getPostsByFilter(mappedFilter);
          
        if (error) {
          throw new Error(error.message);
        }
        
        // 格式化帖子数据
        const formattedPosts = posts.map(post => formatPost(post));
        console.log('formattedPosts', formattedPosts);
        return {
          code: 0,
          msg: "获取帖子成功",
          data: formattedPosts
        };
      } catch (error) {
        console.error('获取帖子失败:', error);
        return {
          code: 1,
          msg: error.message,
          data: []
        };
      }
    },
    
    // 获取单个帖子
    getPostById: async (_, { id }) => {
      try {
        const { data: post, error } = await getPostById(id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!post) {
          throw new Error('Post not found');
        }
        
        return {
          code: 0,
          msg: "Post retrieved successfully",
          data: formatPost(post)
        };
      } catch (error) {
        console.error('Failed to retrieve post:', error);
        return {
          code: 1,
          msg: error.message,
          data: null
        };
      }
    },
    
    // 获取用户的帖子
    getPostsByPosterId: async (_, { posterId }) => {
      try {
        const { data: posts, error } = await getPostsByPosterId(posterId);
            
        if (error) {
          throw new Error(error.message);
        }
        
        return {
          code: 0,
          msg: "Get user posts successfully",
          data: posts.map(post => formatPost(post))
        };
      } catch (error) {
        console.error('Failed to get user posts:', error);
        return {
          code: 1,
          msg: error.message,
          data: []
        };
      }
    },
    
    // 获取当前用户的帖子
    getMyPosts: async (_, __, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error('Not logged in');
        }
        
        const userId = req.session.user.id;
        
        const { data: posts, error } = await getPostsByPosterId(userId);
        
        if (error) {
          throw new Error(error.message);
        }
        
        return {
          code: 0,
          msg: "Get my posts successfully",
          data: posts.map(post => formatPost(post))
        };
      } catch (error) {
        console.error('Failed to get my posts:', error);
        return {
          code: 1,
          msg: error.message,
          data: []
        };
      }
    }
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
          throw new Error(`Validation failed: ${validationErrors.join('; ')}`);
        }
        
        // 处理枚举值映射
        const mappedInput = mapEnumValues(input);
        
        // 格式化帖子数据
        const postData = formatPostInput(mappedInput);
        
        // 添加发布者ID和创建时间
        postData.poster_id = req.session.user.id;
        postData.created_at = new Date();
        postData.status = 'active';
        
        // 根据配置选择使用 Prisma 或 Supabase 创建帖子
        const { data: post, error } = USE_PRISMA
          ? await createPostWithPrisma(postData)
          : await createPost(postData);
        
        if (error) {
          throw new Error(error.message);
        }
        
        return {
          code: 0,
          msg: "Create post successfully",
          data: formatPost(post)
        };
      } catch (error) {
        console.error('Failed to create post:', error);
        return {
          code: 1,
          msg: error.message,
          data: null
        };
      }
    },
    
    // 更新帖子
    updatePost: async (_, { id, input }, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error('Not logged in');
        }
        
        // 检查帖子是否存在并且属于当前用户
        const { data: existingPost, error: fetchError } = await getPostById(id);
        
        if (fetchError || !existingPost) {
          throw new Error('Post not found');
        }
        
        if (existingPost.poster_id !== req.session.user.id) {
          throw new Error('No permission to update this post');
        }
        
        if (existingPost.status === 'deleted') {
          throw new Error('Deleted posts cannot be updated');
        }
        
        // 处理枚举值映射
        const mappedInput = mapEnumValues(input);
        
        // 格式化更新数据
        const updateData = {};
        
        if (mappedInput.category) updateData.category = mappedInput.category;
        if (mappedInput.title) updateData.title = mappedInput.title;
        if (mappedInput.description) updateData.description = mappedInput.description;
        if (mappedInput.condition) updateData.condition = mappedInput.condition;
        if (mappedInput.deliveryType) updateData.delivery_type = mappedInput.deliveryType;
        if (mappedInput.status) updateData.status = mappedInput.status;
        
        // 处理图片
        if (mappedInput.images) {
          if (mappedInput.images.FRONT) updateData.image_front = mappedInput.images.FRONT;
          if ('SIDE' in mappedInput.images) updateData.image_side = mappedInput.images.SIDE;
          if ('BACK' in mappedInput.images) updateData.image_back = mappedInput.images.BACK;
          if ('DAMAGE' in mappedInput.images) updateData.image_damage = mappedInput.images.DAMAGE;
        }
        
        // 处理价格
        if (mappedInput.price) {
          if ('isFree' in mappedInput.price) updateData.price_is_free = mappedInput.price.isFree;
          if ('isNegotiable' in mappedInput.price) updateData.price_is_negotiable = mappedInput.price.isNegotiable;
          
          if (mappedInput.price.isFree) {
            updateData.price_amount = 0;
          } else if (mappedInput.price.amount) {
            updateData.price_amount = mappedInput.price.amount;
          }
        }
        
        // 添加更新时间
        updateData.updated_at = new Date();
        
        // 更新帖子
        const { data: updatedPost, error: updateError } = await updatePost(id, updateData);
        
        if (updateError) {
          throw new Error(updateError.message);
        }
        
        return {
          code: 0,
          msg: "Update post successfully",
          data: formatPost(updatedPost)
        };
      } catch (error) {
        console.error('Failed to update post:', error);
        return {
          code: 1,
          msg: error.message,
          data: null
        };
      }
    },
    
    // 更新帖子状态
    updatePostStatus: async (_, { id, status }, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error('Not logged in');
        }
        
        // 检查帖子是否存在并且属于当前用户
        const { data: existingPost, error: fetchError } = await getPostById(id);
        
        if (fetchError || !existingPost) {
          throw new Error('Post not found');
        }
        
        if (existingPost.poster_id !== req.session.user.id) {
          throw new Error('No permission to update this post');
        }
        
        // 更新帖子状态
        const { data: updatedPost, error: updateError } = await updatePost(id, { status });
        
        if (updateError) {
          throw new Error(updateError.message);
        }
        
        return {
          code: 0,
          msg: "Update post status successfully",
          data: formatPost(updatedPost)
        };
      } catch (error) {
        console.error('Failed to update post status:', error);
        return {
          code: 1,
          msg: error.message,
          data: null
        };
      }
    },
    
    // 删除帖子（实际上是将状态设置为deleted）
    deletePost: async (_, { id }, { req }) => {
      try {
        // 检查用户是否已登录
        if (!req.session.user) {
          throw new Error('Not logged in');
        }
        
        // 检查帖子是否存在并且属于当前用户
        const { data: existingPost, error: fetchError } = await getPostById(id);
        
        if (fetchError || !existingPost) {
          throw new Error('Post not found');
        }
        
        if (existingPost.poster_id !== req.session.user.id) {
          throw new Error('No permission to delete this post');
        }
        
        // 将帖子状态设置为deleted
        const { data: deletedPost, error: updateError } = await updatePost(id, { status: 'deleted' });
        
        if (updateError) {
          throw new Error(updateError.message);
        }
        
        return {
          code: 0,
          msg: "删除帖子成功",
          data: formatPost(deletedPost)
        };
      } catch (error) {
        console.error('删除帖子失败:', error);
        return {
          code: 1,
          msg: error.message,
          data: null
        };
      }
    }
  }
};

export default postResolvers;