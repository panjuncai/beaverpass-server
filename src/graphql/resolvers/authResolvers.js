import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  verifyUser,
} from "../../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { formatUserToCamel,formatEntityToSnake } from "../../utils/helper.js";
const authResolvers = {
  Query: {
    getUserById: async (_, { id }) => {
      const { data, error } = await getUserById(id);
      if (error) throw new Error(error.message);
      if (!data) throw new Error("User not found");
      return formatUserToCamel(data);
    },
    getUserByEmail: async (_, { email }) => {
      const { data, error } = await getUserByEmail(email);
      if (error) throw new Error(error.message);
      if (!data) throw new Error("User not found");
      return formatUserToCamel(data);
    },
    
    // 检查会话状态
    checkSession: async (_, __, { req }) => {
      if (req.session.user) {
        return {
          code: 0,
          msg: "Session is valid",
          data: req.session.user,
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
        const {data:existingUser,error:checkError}=await getUserByEmail(input.email);
        if(existingUser){
          throw new Error("User already exists");
        }
        if(checkError) throw new Error(checkError.message);

        const {password,confirmPassword,...restInput}=input;
        if(password!==confirmPassword){
          throw new Error("Password and confirm password do not match");
        }
        // 生成哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const {data:user,error:createError}=await createUser({
          ...formatEntityToSnake(restInput),
          password: hashedPassword,
          verification_token: verificationToken,
          is_verified: false,
          created_at: new Date(),
          updated_at: new Date(),
        });
        if(createError) throw new Error(createError.message);
        console.log(`user:${JSON.stringify(user,null,2)}`);
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

        return {
          code: 0,
          msg: "Registration successful, please check your email for verification",
          data:formatUserToCamel(user),
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
        const {data:user,error:getUserError}=await getUserByEmail(input.email);
        if(getUserError) throw new Error(getUserError.message);
        if(!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(
          input.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Password is incorrect");

        // 将用户信息存储在 session 中
        req.session.user = formatUserToCamel(user);

        return {
          code: 0,
          msg: "Login successful",
          data: formatUserToCamel(user),
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
        const {data:user,error:verifyError}=await verifyUser(verificationToken);
        if(verifyError) throw new Error(verifyError.message);
        if(!user) throw new Error("User not found");
        const {data:updatedUser,error:updateError}=await updateUser(user.id,{
          is_verified: true,
          updated_at: new Date(),
        });
        if(updateError) throw new Error(updateError.message);
        return {
          code: 0,
          msg: "Email verified successfully",
          data: formatUserToCamel(updatedUser),
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
      // 验证用户只能更新自己的信息
      if (!req.session.user || req.session.user._id !== id) {
        throw new Error("No permission to update other user's information");
      }

      const user = await updateUser(id, userData);

      if (error) throw new Error(error.message);

      // 移除敏感字段
      delete user.password;
      delete user.verification_token;

      // 更新 session 中的用户信息
      req.session.user = {
        ...user,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
      };

      return {
        ...user,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    },
  },
};

export default authResolvers;
