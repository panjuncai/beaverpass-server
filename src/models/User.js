import supabase from "../config/supabase.js";

const createUser = async (userData) => {
    try {
        const { data, error } = await supabase
        .from("users")
        .insert(userData)
        .select()
        .single();
        return {data,error}
    } catch (error) {
        console.error(error);
        return { data: null, error };
    }
};

const verifyUser = async (verifyToken) => {
    try {
        const { data, error } = await supabase
        .from("users")
        .select()
        .eq("verification_token", verifyToken)
        .maybeSingle();
        return {data,error}
    } catch (error) {
        console.error(error);
        return { data: null, error };
    }
};

const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .maybeSingle();
    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

const getUserById = async (id) => {
    try {
        const { data, error } = await supabase
        .from("users")
        .select()
        .eq("id", id)
        .maybeSingle();
        return {data,error}
    } catch (error) {
        console.error(error);
        return { data: null, error };
    }
};

const updateUser = async (id, userData) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", id)
      .select()
      .maybeSingle();
    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error };
  }
};

export { createUser, getUserByEmail, getUserById, updateUser, verifyUser };
