import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { email, password, username}  = req.body;
    try {
        if(!email ||!password ||!username){
            return res.status(400).json({ message: 'All fields are required' });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({ email})
        if(user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, password: hashedPassword, username });

        if(newUser){
            //generate jwt token
            generateToken(newUser._id, res)
            await newUser.save();
            
            res.status(201).json(
                {
                    message: 'User created successfully',
                    user: {
                        id: newUser._id,
                        username: newUser.username,
                        email: newUser.email,
                        profilePic: newUser.profilePic,
                    }
                }
            );
        }else{
            return res.status(400).json({ message: 'Invalid user data' });
        }
        
    } catch (error) {
        console.log("error in signup controller", error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email});
        if(!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        generateToken(user._id, res);
        res.json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
            }
        });

    } catch (error) {
        console.log("error in login controller", error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log("error in logout controller", error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth= (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("error in checkAuth", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};