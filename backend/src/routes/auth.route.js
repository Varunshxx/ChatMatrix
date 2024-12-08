import e from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.protect.js";

const router = e.Router();

router.post('/signup', signup)

router.post('/login', login)

router.post('/logout',logout)

router.put('/update-profile', protectRoute, updateProfile)

router.get('/check', protectRoute, checkAuth)

export default router