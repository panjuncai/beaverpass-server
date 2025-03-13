import prisma from "../lib/prisma.js";

// 使用 Prisma 创建帖子
const createPostWithPrisma = async (postData) => {
  try {
    // 使用 Prisma 创建帖子
    const post = await prisma.post.create({
      data: {
        category: postData.category,
        title: postData.title,
        description: postData.description,
        condition: postData.condition,
        imageFront: postData.image_front,
        imageSide: postData.image_side,
        imageBack: postData.image_back,
        imageDamage: postData.image_damage,
        priceAmount: postData.price_amount,
        priceIsFree: postData.price_is_free,
        priceIsNegotiable: postData.price_is_negotiable,
        deliveryType: postData.delivery_type,
        status: postData.status || 'active',
        poster: {
          connect: {
            id: postData.poster_id
          }
        }
      },
      include: {
        poster: true
      }
    });
    
    // 格式化返回数据，与原有格式保持一致
    const formattedPost = {
      ...post,
      poster_id: post.posterId,
      image_front: post.imageFront,
      image_side: post.imageSide,
      image_back: post.imageBack,
      image_damage: post.imageDamage,
      price_amount: post.priceAmount,
      price_is_free: post.priceIsFree,
      price_is_negotiable: post.priceIsNegotiable,
      delivery_type: post.deliveryType,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
      poster: {
        ...post.poster,
        first_name: post.poster.firstName,
        last_name: post.poster.lastName,
        is_verified: post.poster.isVerified,
        verification_token: post.poster.verificationToken,
        created_at: post.poster.createdAt,
        updated_at: post.poster.updatedAt
      }
    };
    
    return { data: formattedPost, error: null };
  } catch (error) {
    console.error('使用 Prisma 创建帖子失败:', error);
    return { data: null, error };
  }
};

// 使用 Prisma 获取帖子（带过滤条件）
const getPostsByFilterWithPrisma = async (filter = {}) => {
  try {
    // 构建查询条件
    const where = {
      status: {
        not: 'deleted'
      }
    };
    
    if (filter.category) {
      where.category = filter.category;
    }
    
    if (filter.condition) {
      where.condition = filter.condition;
    }
    
    if (filter.status) {
      where.status = filter.status;
    }
    
    if (filter.priceRange) {
      const [min, max] = filter.priceRange.split("-");
      where.priceAmount = {
        gte: parseFloat(min),
        lte: parseFloat(max)
      };
    }
    
    // 执行查询
    const posts = await prisma.post.findMany({
      where,
      include: {
        poster: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 格式化返回数据，与原有格式保持一致
    const formattedPosts = posts.map(post => ({
      ...post,
      poster_id: post.posterId,
      image_front: post.imageFront,
      image_side: post.imageSide,
      image_back: post.imageBack,
      image_damage: post.imageDamage,
      price_amount: post.priceAmount,
      price_is_free: post.priceIsFree,
      price_is_negotiable: post.priceIsNegotiable,
      delivery_type: post.deliveryType,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
      poster: {
        ...post.poster,
        first_name: post.poster.firstName,
        last_name: post.poster.lastName,
        is_verified: post.poster.isVerified,
        verification_token: post.poster.verificationToken,
        created_at: post.poster.createdAt,
        updated_at: post.poster.updatedAt
      }
    }));
    
    return { data: formattedPosts, error: null };
  } catch (error) {
    console.error('使用 Prisma 获取帖子失败:', error);
    return { data: null, error };
  }
};

// 使用 Prisma 获取单个帖子
const getPostByIdWithPrisma = async (id) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        poster: true
      }
    });
    
    if (!post) {
      return { data: null, error: null };
    }
    
    // 格式化返回数据
    const formattedPost = {
      ...post,
      poster_id: post.posterId,
      image_front: post.imageFront,
      image_side: post.imageSide,
      image_back: post.imageBack,
      image_damage: post.imageDamage,
      price_amount: post.priceAmount,
      price_is_free: post.priceIsFree,
      price_is_negotiable: post.priceIsNegotiable,
      delivery_type: post.deliveryType,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
      poster: {
        ...post.poster,
        first_name: post.poster.firstName,
        last_name: post.poster.lastName,
        is_verified: post.poster.isVerified,
        verification_token: post.poster.verificationToken,
        created_at: post.poster.createdAt,
        updated_at: post.poster.updatedAt
      }
    };
    
    return { data: formattedPost, error: null };
  } catch (error) {
    console.error('使用 Prisma 获取帖子失败:', error);
    return { data: null, error };
  }
};

// 使用 Prisma 获取用户的帖子
const getPostsByPosterIdWithPrisma = async (posterId) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        posterId,
        status: {
          not: 'deleted'
        }
      },
      include: {
        poster: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 格式化返回数据
    const formattedPosts = posts.map(post => ({
      ...post,
      poster_id: post.posterId,
      image_front: post.imageFront,
      image_side: post.imageSide,
      image_back: post.imageBack,
      image_damage: post.imageDamage,
      price_amount: post.priceAmount,
      price_is_free: post.priceIsFree,
      price_is_negotiable: post.priceIsNegotiable,
      delivery_type: post.deliveryType,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
      poster: {
        ...post.poster,
        first_name: post.poster.firstName,
        last_name: post.poster.lastName,
        is_verified: post.poster.isVerified,
        verification_token: post.poster.verificationToken,
        created_at: post.poster.createdAt,
        updated_at: post.poster.updatedAt
      }
    }));
    
    return { data: formattedPosts, error: null };
  } catch (error) {
    console.error('使用 Prisma 获取用户帖子失败:', error);
    return { data: null, error };
  }
};

// 使用 Prisma 更新帖子
const updatePostWithPrisma = async (id, postData) => {
  try {
    // 将旧格式的字段名转换为Prisma格式
    const prismaData = {};
    
    if ('category' in postData) prismaData.category = postData.category;
    if ('title' in postData) prismaData.title = postData.title;
    if ('description' in postData) prismaData.description = postData.description;
    if ('condition' in postData) prismaData.condition = postData.condition;
    if ('image_front' in postData) prismaData.imageFront = postData.image_front;
    if ('image_side' in postData) prismaData.imageSide = postData.image_side;
    if ('image_back' in postData) prismaData.imageBack = postData.image_back;
    if ('image_damage' in postData) prismaData.imageDamage = postData.image_damage;
    if ('price_amount' in postData) prismaData.priceAmount = postData.price_amount;
    if ('price_is_free' in postData) prismaData.priceIsFree = postData.price_is_free;
    if ('price_is_negotiable' in postData) prismaData.priceIsNegotiable = postData.price_is_negotiable;
    if ('delivery_type' in postData) prismaData.deliveryType = postData.delivery_type;
    if ('status' in postData) prismaData.status = postData.status;
    if ('updated_at' in postData) prismaData.updatedAt = postData.updated_at;
    
    const post = await prisma.post.update({
      where: { id },
      data: prismaData,
      include: {
        poster: true
      }
    });
    
    // 格式化返回数据
    const formattedPost = {
      ...post,
      poster_id: post.posterId,
      image_front: post.imageFront,
      image_side: post.imageSide,
      image_back: post.imageBack,
      image_damage: post.imageDamage,
      price_amount: post.priceAmount,
      price_is_free: post.priceIsFree,
      price_is_negotiable: post.priceIsNegotiable,
      delivery_type: post.deliveryType,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
      poster: {
        ...post.poster,
        first_name: post.poster.firstName,
        last_name: post.poster.lastName,
        is_verified: post.poster.isVerified,
        verification_token: post.poster.verificationToken,
        created_at: post.poster.createdAt,
        updated_at: post.poster.updatedAt
      }
    };
    
    return { data: formattedPost, error: null };
  } catch (error) {
    console.error('使用 Prisma 更新帖子失败:', error);
    return { data: null, error };
  }
};

export {
  createPostWithPrisma,
  getPostsByFilterWithPrisma,
  getPostByIdWithPrisma,
  getPostsByPosterIdWithPrisma,
  updatePostWithPrisma
};
