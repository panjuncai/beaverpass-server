import supabase from "../config/supabase.js";
import prisma from "../lib/prisma.js";

// 枚举值映射
const categoryMap = {
  "Living Room Furniture": "Living Room Furniture",
  "Bedroom Furniture": "Bedroom Furniture",
  "Dining Room Furniture": "Dining Room Furniture",
  "Office Furniture": "Office Furniture",
  "Outdoor Furniture": "Outdoor Furniture",
  "Storage": "Storage",
  "Other": "Other"
};

const conditionMap = {
  "Like New": "Like New",
  "Gently Used": "Gently Used",
  "Minor Scratches": "Minor Scratches",
  "Stains": "Stains",
  "Needs Repair": "Needs Repair"
};

const deliveryTypeMap = {
  "Home Delivery": "Home Delivery",
  "Pickup": "Pickup",
  "Both": "Both"
};

// 处理输入数据中的枚举值
const processPostData = (postData) => {
  const processedData = { ...postData };
  
  // 确保枚举值正确
  if (processedData.category) {
    processedData.category = categoryMap[processedData.category] || processedData.category;
  }
  
  if (processedData.condition) {
    processedData.condition = conditionMap[processedData.condition] || processedData.condition;
  }
  
  if (processedData.delivery_type) {
    processedData.delivery_type = deliveryTypeMap[processedData.delivery_type] || processedData.delivery_type;
  }
  
  return processedData;
};

// 使用 Supabase 创建帖子
const createPost = async (postData) => {
  try {
    const processedData = processPostData(postData);
    
    const { data, error } = await supabase
      .from("posts")
      .insert(processedData)
      .select(`
        *,
        poster:poster_id (
          id,
          first_name,
          last_name,
          email,
          avatar,
          phone,
          address,
          created_at,
          updated_at
        )
      `)
      .single();
    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

// 使用 Prisma 创建帖子
const createPostWithPrisma = async (postData) => {
  try {
    // 处理输入数据
    const processedData = processPostData(postData);
    
    // 使用 Prisma 创建帖子
    const post = await prisma.post.create({
      data: {
        category: processedData.category,
        title: processedData.title,
        description: processedData.description,
        condition: processedData.condition,
        imageFront: processedData.image_front,
        imageSide: processedData.image_side,
        imageBack: processedData.image_back,
        imageDamage: processedData.image_damage,
        priceAmount: processedData.price_amount,
        priceIsFree: processedData.price_is_free,
        priceIsNegotiable: processedData.price_is_negotiable,
        deliveryType: processedData.delivery_type,
        status: processedData.status || 'active',
        poster: {
          connect: {
            id: processedData.poster_id
          }
        }
      },
      include: {
        poster: true
      }
    });
    
    // 格式化返回数据，与 Supabase 返回格式保持一致
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

// 使用 Supabase 获取帖子（带过滤条件）
const getPostsByFilter = async (filter = {}) => {
  try {
    // 处理过滤条件中的枚举值
    const processedFilter = { ...filter };
    if (processedFilter.category) {
      processedFilter.category = categoryMap[processedFilter.category] || processedFilter.category;
    }
    
    if (processedFilter.condition) {
      processedFilter.condition = conditionMap[processedFilter.condition] || processedFilter.condition;
    }
    
    // 构建查询
    let query = supabase
      .from("posts")
      .select(`
      *,
      poster:poster_id (
        id,
        first_name,
        last_name,
        email,
        avatar,
        phone,
        address,
        created_at,
        updated_at
      )
    `)
      .neq("status", "deleted")
      .order("created_at", { ascending: false });

    // 添加过滤条件
    if (processedFilter.category) {
      query = query.eq("category", processedFilter.category);
    }

    if (processedFilter.condition) {
      query = query.eq("condition", processedFilter.condition);
    }

    if (processedFilter.status) {
      query = query.eq("status", processedFilter.status);
    }

    if (processedFilter.priceRange) {
      const [min, max] = processedFilter.priceRange.split("-");
      query = query.gte("price_amount", min).lte("price_amount", max);
    }

    // 执行查询
    const { data: posts, error } = await query;
    return { data: posts, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

// 使用 Prisma 获取帖子（带过滤条件）
const getPostsByFilterWithPrisma = async (filter = {}) => {
  try {
    // 处理过滤条件中的枚举值
    const processedFilter = { ...filter };
    if (processedFilter.category) {
      processedFilter.category = categoryMap[processedFilter.category] || processedFilter.category;
    }
    
    if (processedFilter.condition) {
      processedFilter.condition = conditionMap[processedFilter.condition] || processedFilter.condition;
    }
    
    // 构建查询条件
    const where = {
      status: {
        not: 'deleted'
      }
    };
    
    if (processedFilter.category) {
      where.category = processedFilter.category;
    }
    
    if (processedFilter.condition) {
      where.condition = processedFilter.condition;
    }
    
    if (processedFilter.status) {
      where.status = processedFilter.status;
    }
    
    if (processedFilter.priceRange) {
      const [min, max] = processedFilter.priceRange.split("-");
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
    
    // 格式化返回数据，与 Supabase 返回格式保持一致
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

const getAllPosts = async () => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        poster:poster_id (
          id,
          first_name,
          last_name,
          email,
          avatar,
          phone,
          address,
          created_at,
          updated_at
        )
      `)
      .neq("status", "deleted")
      .order("created_at", { ascending: false });
    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

const getPostById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        poster:poster_id (
          id,
          first_name,
          last_name,
          email,
          avatar,
          phone,
          address,
          created_at,
          updated_at
        )
      `)
      .eq("id", id)
      .neq("status", "deleted")
      .single();
    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

const getPostsByPosterId = async (posterId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        poster:poster_id (
          id,
          first_name,
          last_name,
          email,
          avatar,
          phone,
          address,
          created_at,
          updated_at
        )
      `)
      .eq("poster_id", posterId)
      .neq("status", "deleted")
      .order("created_at", { ascending: false });
    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

const updatePost = async (id, postData) => {
  try {
    const processedData = processPostData(postData);
    
    const { data, error } = await supabase
      .from("posts")
      .update(processedData)
      .eq("id", id)
      .select(`
        *,
        poster:poster_id (
          id,
          first_name,
          last_name,
          email,
          avatar,
          phone,
          address,
          created_at,
          updated_at
        )
      `)
      .single();
    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

export {
  createPost,
  createPostWithPrisma,
  getAllPosts,
  getPostById,
  updatePost,
  getPostsByPosterId,
  getPostsByFilter,
  getPostsByFilterWithPrisma,
};
