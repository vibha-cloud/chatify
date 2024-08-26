import React, { useState, useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  Button,
  Stack,
  Text,
  Avatar,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender, getSenderFull } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { TbLogout2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const fetchChats = async () => {
    if (!loggedUser) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${loggedUser.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error fetching chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUser) {
      setLoggedUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (loggedUser) {
      fetchChats(); // Fetch chats as soon as loggedUser is available
    }
  }, [loggedUser]);

  useEffect(() => {
    if (loggedUser && fetchAgain !== undefined) {
      fetchChats(); // Fetch chats whenever fetchAgain changes
    }
  }, [fetchAgain, loggedUser]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      w={{ base: "100%", md: "35%" }}
      p={3}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        fontSize={{ base: "28px", md: "26px" }}
        textColor="black"
        w="100%"
        px={3}
        py={6}
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "16px", lg: "20px" }}
            colorScheme="blue"
            marginLeft={3}
            rightIcon={<AddIcon />}
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowX="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                key={chat._id}
                px={3}
                py={3}
                bg={selectedChat?._id === chat._id ? "#1d94d9" : "#E8E8E8"}
                color={selectedChat?._id === chat._id ? "white" : "black"}
                borderRadius="lg"
                cursor="pointer"
                display="flex"
                alignItems="center"
              >
                <Avatar
                  mr={3}
                  size="sm"
                  cursor="pointer"
                  name={
                    !chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName
                  }
                  src={
                    !chat.isGroupChat
                      ? getSenderFull(loggedUser, chat.users).pic
                      : chat.chatPic
                  }
                />
                <Text fontSize="lg">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
      <Box className="flex justify-between items-center bg-white w-full border-b-2 border-gray-200 px-[10px] py-[5px]">
        <Tooltip
          label="Log out from this profile"
          hasArrow
          placement="bottom-end"
        >
          <Button variant="ghost" onClick={handleLogout}>
            <TbLogout2 fontSize={20} />
            <Text display={{ base: "none", md: "flex" }} px="4">
              Log Out
            </Text>
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default MyChats;
