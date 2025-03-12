import {
  updateUserWithPrisma,
  getUserByEmailWithPrisma,
  createUserWithPrisma,
  verifyUserWithPrisma,
} from "../../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

const authResolvers = {
  Query: {
    getUserById: async (_, { id }) => {
      try {
        const { data, error } = await getUserByIdWithPrisma(id);
        if (error) throw new Error(error.message);
        if (!data) throw new Error("User not found");
        
        // 创建一个不包含敏感信息的用户对象
        const safeUser = { ...data };
        delete safeUser.password;
        delete safeUser.verificationToken;
        
        return {
          code: 0,
          msg: "User found",
          data: safeUser
        };
      } catch (error) {
        return {
          code: 1,
          msg: error.message,
          data: null
        };
      }
    },
    
    getUserByEmail: async (_, { email }) => {
      try {
        const { data, error } = await getUserByEmailWithPrisma(email);
        if (error) throw new Error(error.message);
        if (!data) throw new Error("User not found");

        // 创建一个不包含敏感信息的用户对象
        const safeUser = { ...data };
        delete safeUser.password;
        delete safeUser.verificationToken;
        
        return {
          code: 0,
          msg: "User found",
          data: safeUser
        };
      } catch (error) {
        return {
          code: 1,
          msg: error.message,
          data: null
        };
      }
    },
    
    // 检查会话状态
    checkSession: async (_, __, { req }) => {
      if (req.session.user) {
        // 会话中的用户信息应该已经是安全的（不包含密码和验证令牌）
        // 但为了确保安全，我们再次检查并移除敏感字段
        const safeUser = { ...req.session.user };
        if (safeUser.password) delete safeUser.password;
        if (safeUser.verificationToken) delete safeUser.verificationToken;
        
        return {
          code: 0,
          msg: "Session is valid",
          data: safeUser,
        };
      } else {
        return {
          code: 4001,
          msg: "Not logged in",
          data: null,
        };
      }
    },
  },

  Mutation: {
    // 注册
    register: async (_, { input }) => {
      try {
        // 检查用户是否已存在
        const { data: existingUser, error: checkError } = await getUserByEmailWithPrisma(input.email);
        if (existingUser) {
          throw new Error("User already exists");
        }
        if (checkError) throw new Error(checkError.message);

        const { password, confirmPassword, ...restInput } = input;
        if (password !== confirmPassword) {
          throw new Error("Password and confirm password do not match");
        }
        
        // 生成哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        
        // 根据是否使用 Prisma 准备用户数据
        let userData = {
            ...restInput,
            password: hashedPassword,
            verificationToken: verificationToken,
            isVerified: false,
          };
        
        const { data: user, error: createError } = await createUserWithPrisma(userData);
        if (createError) throw new Error(createError.message);
        
        // 验证邮件链接
        const verifyLink = `${process.env.BASE_URI}/verifyEmail?token=${verificationToken}`;

        // 配置邮件发送
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "qqxpp0001@gmail.com",
            pass: "xfgo vzop yrvu cego",
          },
        });

        await transporter.sendMail({
          from: "qqxpp0001@gmail.com",
          to: user.email,
          subject: "BeaverPass Email account verification",
          html: `<p>Please click the link to verify your Email.</p>
            <p>The link will expire after one day.</p>
        <a href="${verifyLink}">${verifyLink}</a>`,
        });

        // 创建一个不包含敏感信息的用户对象
        const safeUser = { ...user };
        delete safeUser.password;
        delete safeUser.verificationToken;

        return {
          code: 0,
          msg: "Registration successful, please check your email for verification",
          data: safeUser,
        };
      } catch (e) {
        return {
          code: 1,
          msg: e.message,
          data: null,
        };
      }
    },

    // 登录
    login: async (_, { input }, { req }) => {
      try {
        const { data: user, error: getUserError } = await getUserByEmailWithPrisma(input.email);
        if (getUserError) throw new Error(getUserError.message);
        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(
          input.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Password is incorrect");

        // 创建一个不包含敏感信息的用户对象
        const safeUser = { ...user };
        
        // 移除敏感字段
        delete safeUser.password;
        delete safeUser.verificationToken;
        
        // 将安全的用户信息存储在 session 中
        req.session.user = safeUser;

        return {
          code: 0,
          msg: "Login successful",
          data: safeUser
        };
      } catch (e) {
        return {
          code: 1,
          msg: e.message,
          data: null,
        };
      }
    },

    // 登出
    logout: async (_, __, { req, res }) => {
      return new Promise((resolve) => {
        req.session.destroy((e) => {
          if (e) {
            console.error("退出登录时发生错误:", e);
            resolve({
              code: 1,
              msg: `Logout failed: ${e.message}`,
              data: null,
            });
          } else {
            res.clearCookie("sessionId");
            resolve({
              code: 0,
              msg: "Logout successful",
              data: null,
            });
          }
        });
      });
    },

    // 验证邮箱
    verifyUser: async (_, { verificationToken }) => {
      try {
        const { data: user, error: verifyError } = await verifyUserWithPrisma(verificationToken);
        if (verifyError) throw new Error(verifyError.message);
        if (!user) throw new Error("User not found");
        
        // 根据是否使用 Prisma 准备更新数据
        const updateData = { isVerified: true };
        
        const { data: updatedUser, error: updateError } = await updateUserWithPrisma(user.id, updateData);
        if (updateError) throw new Error(updateError.message);
        
        // 创建一个不包含敏感信息的用户对象
        const safeUser = { ...updatedUser };
        delete safeUser.password;
        delete safeUser.verificationToken;
        
        return {
          code: 0,
          msg: "Email verified successfully",
          data: safeUser,
        };
      } catch (e) {
        return {
          code: 1,
          msg: e.message,
          data: null,
        };
      }
    },

    // 更新用户
    updateUser: async (_, { id, ...userData }, { req }) => {
      try {
        // 验证用户只能更新自己的信息
        if (!req.session.user || req.session.user.id !== id) {
          throw new Error("No permission to update other user's information");
        }
        
        // 根据是否使用 Prisma 准备更新数据
        const updateData = userData;
        
        const { data: updatedUser, error } = await updateUserWithPrisma(id, updateData);
        if (error) throw new Error(error.message);
        
        // 创建一个不包含敏感信息的用户对象
        const safeUser = { ...updatedUser };
        delete safeUser.password;
        delete safeUser.verificationToken;
        
        // 更新 session 中的用户信息
        req.session.user = safeUser;
        
        return {
          code: 0,
          msg: "User updated successfully",
          data: safeUser,
        };
      } catch (e) {
        return {
          code: 1,
          msg: e.message,
          data: null,
        };
      }
    },
  },
};

export default authResolvers;
