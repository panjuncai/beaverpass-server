const nodemailer = require("nodemailer");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("../config/env")();
const crypto = require('crypto');

const registerUser = async ({ email, password, firstName, lastName }) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      isVerified: false,
    });
    
    await user.save();

    // 生成验证token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

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

    return user;
  } catch (e) {
    throw e;
  }
};

const loginUser = async ({ email, password }) => {
  try {
    let user = await User.findOne({ email });
    if (!user) {
      throw new Error("User is not exists");
    }

    if (!user.isVerified) {
      throw new Error("User is not verified");
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      throw new Error("Invalid password");
    }

    return user;
  } catch (e) {
    throw e;
  }
};

const verifyUser = async (token) => {
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error("Invalid verification link");
    }

    if (user.isVerified) {
      throw new Error("Email has been verified");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return user;
  } catch (e) {
    throw e;
  }
};

module.exports = { registerUser, loginUser, verifyUser };
