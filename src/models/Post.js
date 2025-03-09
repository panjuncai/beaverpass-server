import supabase from "../config/supabase.js";

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
          avatar
        )
      `)
      .single();
    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

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
        avatar
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
          avatar
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
          avatar
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
          avatar
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
          avatar
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
  getAllPosts,
  getPostById,
  updatePost,
  getPostsByPosterId,
  getPostsByFilter,
};
