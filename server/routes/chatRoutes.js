import express from "express";
import {
  accessChat,
  addToGroup,
  createGroupChat,
  fetchChats,
  removeFromGroup,
  renameGroup,
} from "../controllers/chatControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router(); // Create a new express router

// Route to access a chat, protected by the protect middleware
router.route("/").post(protect, accessChat);

// Route to fetch all chats for a user
router.route("/").get(protect, fetchChats);

// Route to create a new group chat
router.route("/group").post(protect, createGroupChat);

// Route to rename a group chat
router.route("/rename").put(protect, renameGroup);

// Route to add a user to a group chat
router.route("/groupadd").put(protect, addToGroup);

// Route to remove a user from a group chat
router.route("/groupremove").delete(protect, removeFromGroup);

export default router;
