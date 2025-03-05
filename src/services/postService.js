const supabase = require('../lib/supabase');

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

    // 创建帖子
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        category: processedPostData.category,
        title: processedPostData.title,
        description: processedPostData.description,
        condition: processedPostData.condition,
        images: processedPostData.images,
        price: processedPostData.price,
        delivery_type: processedPostData.deliveryType,
        poster_id: processedPostData.poster,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      })
      .select(`
        *,
        poster:poster_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return post;
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
          id,
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
      // 注意：这里需要根据实际存储方式调整
      // 假设价格存储在 price->amount 字段中
      query = query.gte('price->amount', min).lte('price->amount', max);
    }
    
    // 执行查询
    const { data: posts, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!posts || posts.length === 0) {
      throw new Error('No posts found');
    }
    
    return posts;
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
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', postId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
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
    // 验证帖子所有权
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('poster_id')
      .eq('id', postId)
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
      .eq('id', postId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    return updatedPost;
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
    
    return posts;
  } catch (error) {
    throw new Error(`Failed to get user posts: ${error.message}`);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePostStatus,
  getPostsByUserId
}; 