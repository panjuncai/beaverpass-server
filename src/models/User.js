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


// 导出函数
export { 
  createUserWithPrisma,
  verifyUserWithPrisma,
  getUserByEmailWithPrisma,
  getUserByIdWithPrisma,
  updateUserWithPrisma,
};
