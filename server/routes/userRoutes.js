import express from "express";
import { allUsers, authUser, registerUser, searchUsers } from "../controllers/userControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User registration and fetching all users
router.route("/").post(registerUser).get(protect, allUsers);

// User login
router.post("/login", authUser);

// Search users route
router.get("/search", protect, searchUsers);

export default router;
