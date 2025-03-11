import supabase from "../config/supabase.js";
import prisma from "../lib/prisma.js";

// 使用 Prisma 创建用户
const createUserWithPrisma = async (userData) => {
    try {
        const user = await prisma.user.create({
            data: userData
        });
        return { data: user, error: null };
    } catch (error) {
        console.error('使用 Prisma 创建用户失败:', error);
        return { data: null, error };
    }
};

// 使用 Prisma 验证用户
const verifyUserWithPrisma = async (verifyToken) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: verifyToken
            }
        });
        return { data: user, error: null };
    } catch (error) {
        console.error('使用 Prisma 验证用户失败:', error);
        return { data: null, error };
    }
};

// 使用 Prisma 通过邮箱获取用户
const getUserByEmailWithPrisma = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        return { data: user, error: null };
    } catch (error) {
        console.error('使用 Prisma 通过邮箱获取用户失败:', error);
        return { data: null, error };
    }
};

// 使用 Prisma 通过 ID 获取用户
const getUserByIdWithPrisma = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });
        return { data: user, error: null };
    } catch (error) {
        console.error('使用 Prisma 通过 ID 获取用户失败:', error);
        return { data: null, error };
    }
};

// 使用 Prisma 更新用户
const updateUserWithPrisma = async (id, userData) => {
    try {
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: userData
        });
        return { data: user, error: null };
    } catch (error) {
        console.error('使用 Prisma 更新用户失败:', error);
        return { data: null, error };
    }
};

// 使用 Supabase 创建用户
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

// 使用 Supabase 验证用户
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

// 使用 Supabase 通过邮箱获取用户
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

// 使用 Supabase 通过 ID 获取用户
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

// 使用 Supabase 更新用户
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

// 根据环境变量选择使用 Prisma 或 Supabase
const USE_PRISMA = process.env.USE_PRISMA === 'true';

// 根据环境变量选择要导出的函数
const exportCreateUser = USE_PRISMA ? createUserWithPrisma : createUser;
const exportVerifyUser = USE_PRISMA ? verifyUserWithPrisma : verifyUser;
const exportGetUserByEmail = USE_PRISMA ? getUserByEmailWithPrisma : getUserByEmail;
const exportGetUserById = USE_PRISMA ? getUserByIdWithPrisma : getUserById;
const exportUpdateUser = USE_PRISMA ? updateUserWithPrisma : updateUser;

// 导出函数
export { 
  // 导出根据环境变量选择的函数
  exportCreateUser as createUser,
  exportVerifyUser as verifyUser,
  exportGetUserByEmail as getUserByEmail,
  exportGetUserById as getUserById,
  exportUpdateUser as updateUser,
  
  // 同时导出原始函数，以便在需要时直接使用
  createUserWithPrisma,
  verifyUserWithPrisma,
  getUserByEmailWithPrisma,
  getUserByIdWithPrisma,
  updateUserWithPrisma,
  
  createUser as createUserWithSupabase,
  verifyUser as verifyUserWithSupabase,
  getUserByEmail as getUserByEmailWithSupabase,
  getUserById as getUserByIdWithSupabase,
  updateUser as updateUserWithSupabase
};
