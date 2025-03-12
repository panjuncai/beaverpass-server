import supabase from "../config/supabase.js";
import prisma from "../lib/prisma.js";

// 使用 Supabase 创建帖子
const createPost = async (postData) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert(postData)
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
    
    
    return { data:post, error: null };
  } catch (error) {
    console.error('使用 Prisma 创建帖子失败:', error);
    return { data: null, error };
  }
};

// 使用 Supabase 获取帖子（带过滤条件）
const getPostsByFilter = async (filter = {}) => {
  try {
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
    if (filter.category) {
      query = query.eq("category", filter.category);
    }

    if (filter.condition) {
      query = query.eq("condition", filter.condition);
    }

    if (filter.status) {
      query = query.eq("status", filter.status);
    }

    if (filter.priceRange) {
      const [min, max] = filter.priceRange.split("-");
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
    const { data, error } = await supabase
      .from("posts")
      .update(postData)
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
