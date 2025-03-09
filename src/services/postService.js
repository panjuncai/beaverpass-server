import supabase from '../lib/supabase.js';

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
    const priceIsFree = postData.price.isFree || false;
    const priceAmount = priceIsFree ? 0 : postData.price.amount;
    const priceIsNegotiable = postData.price.isNegotiable || false;

    // 创建帖子
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        category: postData.category,
        title: postData.title,
        description: postData.description,
        condition: postData.condition,
        image_front: postData.images.FRONT,
        image_side: postData.images.SIDE || null,
        image_back: postData.images.BACK || null,
        image_damage: postData.images.DAMAGE || null,
        price_amount: priceAmount,
        price_is_free: priceIsFree,
        price_is_negotiable: priceIsNegotiable,
        delivery_type: postData.deliveryType,
        poster_id: postData.poster,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      })
      .select(`
        *,
        poster:poster_id (
          _id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 转换返回格式以匹配前端期望的结构
    const formattedPost = {
      ...post,
      images: {
        FRONT: post.image_front,
        SIDE: post.image_side,
        BACK: post.image_back,
        DAMAGE: post.image_damage
      },
      price: {
        amount: post.price_amount.toString(),
        isFree: post.price_is_free,
        isNegotiable: post.price_is_negotiable
      },
      deliveryType: post.delivery_type,
      poster: {
        _id: post.poster._id,
        firstName: post.poster.first_name,
        lastName: post.poster.last_name,
        email: post.poster.email
      }
    };

    return formattedPost;
  } catch (e) {
    throw e;
  }
};

const getAllPosts = async (filters) => {
  try {
    const { category, condition, priceRange } = filters;
    
    // 构建查询
    let query = supabase
      .from('posts')
      .select(`
        *,
        poster:poster_id (
          _id,
          first_name,
          last_name
        )
      `)
      .neq('status', 'deleted');
    
    // 添加过滤条件
    if (category) {
      query = query.eq('category', category);
    }
    
    if (condition) {
      query = query.eq('condition', condition);
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      query = query.gte('price_amount', min).lte('price_amount', max);
    }
    
    // 执行查询
    const { data: posts, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!posts || posts.length === 0) {
      throw new Error('No posts found');
    }
    
    // 转换返回格式以匹配前端期望的结构
    const formattedPosts = posts.map(post => ({
      ...post,
      images: {
        FRONT: post.image_front,
        SIDE: post.image_side,
        BACK: post.image_back,
        DAMAGE: post.image_damage
      },
      price: {
        amount: post.price_amount.toString(),
        isFree: post.price_is_free,
        isNegotiable: post.price_is_negotiable
      },
      deliveryType: post.delivery_type,
      poster: {
        _id: post.poster._id,
        firstName: post.poster.first_name,
        lastName: post.poster.last_name
      }
    }));
    
    return formattedPosts;
  } catch (e) {
    throw e;
  }
};

const getPostById = async (postId) => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        poster:poster_id (
          _id,
          first_name,
          last_name
        )
      `)
      .eq('_id', postId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // 转换返回格式以匹配前端期望的结构
    const formattedPost = {
      ...post,
      images: {
        FRONT: post.image_front,
        SIDE: post.image_side,
        BACK: post.image_back,
        DAMAGE: post.image_damage
      },
      price: {
        amount: post.price_amount.toString(),
        isFree: post.price_is_free,
        isNegotiable: post.price_is_negotiable
      },
      deliveryType: post.delivery_type,
      poster: {
        _id: post.poster._id,
        firstName: post.poster.first_name,
        lastName: post.poster.last_name
      }
    };
    
    return formattedPost;
  } catch (e) {
    throw e;
  }
};

const updatePostStatus = async (postId, status, userId) => {
  try {
    // 验证帖子所有权
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('poster_id')
      .eq('_id', postId)
      .single();
    
    if (fetchError || !post) {
      throw new Error('Post not found');
    }
    
    if (post.poster_id !== userId) {
      throw new Error('No permission');
    }
    
    // 更新帖子状态
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('_id', postId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    // 转换返回格式以匹配前端期望的结构
    const formattedPost = {
      ...updatedPost,
      images: {
        FRONT: updatedPost.image_front,
        SIDE: updatedPost.image_side,
        BACK: updatedPost.image_back,
        DAMAGE: updatedPost.image_damage
      },
      price: {
        amount: updatedPost.price_amount.toString(),
        isFree: updatedPost.price_is_free,
        isNegotiable: updatedPost.price_is_negotiable
      },
      deliveryType: updatedPost.delivery_type
    };
    
    return formattedPost;
  } catch (e) {
    throw e;
  }
};

const getPostsByUserId = async (userId) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('poster_id', userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // 转换返回格式以匹配前端期望的结构
    const formattedPosts = posts.map(post => ({
      ...post,
      images: {
        FRONT: post.image_front,
        SIDE: post.image_side,
        BACK: post.image_back,
        DAMAGE: post.image_damage
      },
      price: {
        amount: post.price_amount.toString(),
        isFree: post.price_is_free,
        isNegotiable: post.price_is_negotiable
      },
      deliveryType: post.delivery_type
    }));
    
    return formattedPosts;
  } catch (error) {
    throw new Error(`Failed to get user posts: ${error.message}`);
  }
};

export {
  createPost,
  getAllPosts,
  getPostById,
  updatePostStatus,
  getPostsByUserId
}; 