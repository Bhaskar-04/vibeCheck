import { json } from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../Utils/generateTokens.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "passwords doesnt match" });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const boyPFP = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlPFP = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      fullName,
      username,
      password: hashedpassword,
      gender,
      pfp: gender === "male" ? boyPFP : girlPFP,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        pfp: newUser.pfp,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Internal Server Error", error.message);
    res.status(500).json({ error });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await user.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      res.status(400).json({ error: "Invalid Username or Password" });
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      pfp: user.pfp,
    });
  } catch (error) {
    console.log("Internal Server Error", error.message);
    res.status(500).json({ error });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ error: "Logged out Successfully" });
  } catch (error) {
    console.log("Internal Server Error", error.message);
    res.status(500).json({ error });
  }
};
