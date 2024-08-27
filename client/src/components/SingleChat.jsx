import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import chatBg from "../assets/chat-bg.jpg";
import {
  Box,
  IconButton,
  Text,
  Heading,
  Spinner,
  FormControl,
  Input,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { IoIosSend } from "react-icons/io";
import { TiMessages } from "react-icons/ti";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";

const ENDPOINT = "https://chatify-mern-chat-app.onrender.com";
let socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef = useRef(null); // Ref for emoji picker container

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const toast = useToast();
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const handleBackClick = () => {
    setSelectedChat("");
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      if (socket) {
        socket.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Failed to load the messages.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("setup", user);

    socket.on("connected", () => {
      setSocketConnected(true);
    });

    socket.on("message received", (newMessageReceived) => {
      if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      } else {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      }
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stop typing", () => setTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user, selectedChat]);

  useEffect(() => {
    fetchMessages();

    return () => {
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [selectedChat]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendMessage = async (e) => {
    if ((e.type === "click" || e.key === "Enter") && newMessage) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");

        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "An error occurred.",
          description: "Failed to send the message.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;
    if (typingTimeout) clearTimeout(typingTimeout);

    socket.emit("typing", selectedChat._id);

    setTypingTimeout(
      setTimeout(() => {
        socket.emit("stop typing", selectedChat._id);
      }, 2000)
    );
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  return (
    <>
      {!selectedChat ? (
        <Box
          display="flex"
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          h="100%"
          w="100%"
          borderRadius="lg"
          backgroundImage={`url(${chatBg})`}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
        >
          <Text fontSize="3xl" textAlign="center">
            <span>Welcome {user.name} !</span>
            <br />
            <span>Select a chat to start messaging</span>
          </Text>
          <TiMessages className="text-3xl md:text-6xl text-center" />
        </Box>
      ) : (
        <>
          <Box
            pb={3}
            px={2}
            w="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={handleBackClick}
              fontSize={23}
            />

            {selectedChat.isGroupChat ? (
              <>
                <Heading as="h1" size="md">
                  {selectedChat.chatName.toUpperCase()}
                </Heading>
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            ) : (
              <>
                <Heading as="h1" size="md" fontWeight="bold">
                  {getSender(user, selectedChat.users).toUpperCase()}
                </Heading>
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            )}
          </Box>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            bg="#E8E8E8"
            w="100%"
            h="100%"
            p={1}
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <Box
                display="flex"
                flexDir="column"
                justifyContent="flex-end"
                bg="#E8E8E8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="auto"
                backgroundImage={`url(${chatBg})`}
                backgroundSize="cover"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
              >
                <ScrollableChat messages={messages} />
              </Box>
            )}

            <FormControl isRequired mt={3} position="relative">
              {typing && (
                <div style={{ marginBottom: "15px", marginLeft: "0px" }}>
                  <Lottie options={defaultOptions} width={120} />
                </div>
              )}
              <Box display="flex" alignItems="center">
                <IconButton
                  icon={<BsEmojiSmile />}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  fontSize="20px"
                  bgColor="#E8E8E8"
                  borderRadius="lg"
                  _hover={{ bgColor: "#D8D8D8" }}
                />
                {showEmojiPicker && (
                  <Box
                    ref={emojiPickerRef}
                    position="absolute"
                    bottom="60px"
                    zIndex="100"
                  >
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      pickerStyle={{ width: "300px" }}
                    />
                  </Box>
                )}
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={sendMessage}
                  pl={4}
                  flex="1"
                />
                <IconButton
                  icon={<IoIosSend />}
                  onClick={sendMessage}
                  fontSize="20px"
                  bgColor="#38B2AC"
                  color="white"
                  _hover={{ bgColor: "#38aaa8" }}
                />
              </Box>
            </FormControl>
          </Box>
        </>
      )}
    </>
  );
};

export default SingleChat;
