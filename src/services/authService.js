const nodemailer = require("nodemailer");
const supabase = require('../lib/supabase');
const bcrypt = require("bcryptjs");
require("../config/env")();
const crypto = require('crypto');

const registerUser = async ({ email, password, firstName, lastName }) => {
  try {
    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      throw new Error("User already exists");
    }
    
    // 生成密码哈希和验证令牌
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // 创建新用户
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        is_verified: false,
        verification_token: verificationToken,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select('*')
      .single();
    
    if (createError) {
      throw new Error(createError.message);
    }
    
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
      to: email,
      subject: "BeaverPass Email account verification",
      html: `<p>Please click the link to verify your Email.</p>
            <p>The link will expire after one day.</p>
        <a href="${verifyLink}">${verifyLink}</a>`,
    });

    // 移除敏感字段
    delete user.password;
    delete user.verification_token;
    
    return user;
  } catch (e) {
    throw e;
  }
};

const loginUser = async ({ email, password }) => {
  try {
    // 查找用户
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (fetchError || !user) {
      throw new Error("User is not exists");
    }

    if (!user.is_verified) {
      throw new Error("Email is not verified");
    }

    // 验证密码
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      throw new Error("Invalid password");
    }

    // 移除敏感字段
    delete user.password;
    delete user.verification_token;
    
    return user;
  } catch (e) {
    throw e;
  }
};

const verifyUser = async (token) => {
  try {
    // 查找用户
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();
    
    if (fetchError || !user) {
      throw new Error("Invalid verification link");
    }

    if (user.is_verified) {
      throw new Error("Email has been verified");
    }

    // 更新用户验证状态
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_token: null,
        updated_at: new Date()
      })
      .eq('id', user.id)
      .select('*')
      .single();
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    // 移除敏感字段
    delete updatedUser.password;
    
    return updatedUser;
  } catch (e) {
    throw e;
  }
};

module.exports = { registerUser, loginUser, verifyUser };
