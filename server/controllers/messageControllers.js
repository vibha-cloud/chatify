import expressAsyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400);
    throw new Error("Content and chatId are required");
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    // Populating sender and chat details
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");

    // Populating users within the chat
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Updating the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    console.error("Error in sendMessage:", error.stack); // Log the detailed error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

export { sendMessage, allMessages };
