import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

// Access or create a chat between the logged-in user and another user
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("User ID is required");
  }

  try {
    // Check if a chat already exists between the users
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // Populate sender details in the latest message
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email pic",
    });

    if (isChat.length > 0) {
      res.status(200).send(isChat[0]);
    } else {
      // Create a new chat if it doesn't exist
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(201).send(fullChat);
    }
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Failed to access or create chat");
  }
});

// Fetch all chats for the logged-in user
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email pic",
    });

    res.status(200).send(populatedChats);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Failed to fetch chats");
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name } = req.body;

  if (!name || !Array.isArray(users) || users.length < 2) {
    res.status(400);
    throw new Error(
      "Please enter chat name and select users to create a group"
    );
  }

  users.push(req.user); // Ensure 'users' is an array and push 'req.user'

  try {
    const chatData = {
      chatName: name,
      isGroupChat: true,
      users,
      groupAdmin: req.user,
    };

    const createdChat = await Chat.create(chatData);

    const fullGroupChat = await Chat.findOne({ _id: createdChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Failed to create group chat");
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    res.status(400);
    throw new Error("Chat ID and chat name are required");
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found!");
    }

    chat.chatName = chatName;

    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Failed to rename group chat");
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    res.status(400);
    throw new Error("Chat ID and user ID are required");
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found!");
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found!");
    }

    chat.users.push(user);

    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Failed to add user to group chat");
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    res.status(400);
    throw new Error("Chat ID and user ID are required");
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found!");
    }

    const userIndex = chat.users.indexOf(userId);

    if (userIndex > -1) {
      chat.users.splice(userIndex, 1);
    }

    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error("Failed to remove user from group chat");
  }
});

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
