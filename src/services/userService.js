const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
require('../config/env')();


const registerUser = async ({ email, password }) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      isVerified: false,
    });
    await user.save();

    // verify token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // verify mail link
    const verifyLink = `${process.env.BASE_URI}/verifyEmail?token=${token}`;

    // config nodemailer
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

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      throw new Error("Invalid password");
    }

    if (!user.isVerified) {
      throw new Error("User is not verified");
    }
    return user;
  } catch (e) {
    throw e;
  }
};


const verifyUser=async (userId)=>{
    try{
        const user=await User.findById(userId);
        if(!user){
            throw new Error('User is not exists');
        }

        if(user.isVerified){
            throw new Error('Email has been verified')
        }

        user.isVerified=true;
        await user.save();
        return user;
    }catch(e){
        throw e;
    }
}

const getUser=async (userId)=>{
    try{
      // console.log(`user service userid is ${userId}`)
        const user=await User.findById(userId);
        if(!user){
            throw new Error('User is not exists');
        }
        return user;
    }catch(e){
        throw e;
    }
}

module.exports = { registerUser, loginUser,verifyUser,getUser };
