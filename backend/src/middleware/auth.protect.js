import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) =>{
    try{
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({msg: "Not authorized, token is required"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) return res.status(401).json({msg: "Not authorized, Invalid token"});

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.status(404).json({msg: "User not found"});
        
        req.user = user;
        next();

    }catch(e){
        console.error("Error in protectRoute Middleware",e.message);
        return res.status(500).json({msg: "Server error"});
    }
}