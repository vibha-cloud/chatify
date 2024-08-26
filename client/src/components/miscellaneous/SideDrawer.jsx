import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Tooltip,
  MenuDivider,
  Drawer,
  useDisclosure,
  DrawerOverlay,
  DrawerHeader,
  DrawerBody,
  DrawerContent,
  DrawerCloseButton,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../userAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import { ToastContainer, toast as toastifyToast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SideDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const navigate = useNavigate();
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      toast({
        title: "Search field is empty",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/user/search?name=${search}`,
        config
      );

      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      setLoading(false);
      toast({
        title: "An error occurred",
        description: error.response?.data?.message || "Failed to fetch users",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((chat) => chat._id === data._id)) {
        setChats([...chats, data]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleNotificationClick = (notif) => {
    setSelectedChat(notif.chat);
    setNotification(notification.filter((n) => n._id !== notif._id));
    setShowNotification(false); // Hide notification badge after clicking
  };

  const showNotificationToast = () => {
    if (!notification.length) {
      toastifyToast.info("No new notifications");
      return;
    }
    notification.forEach((notif) => {
      toastifyToast.info(
        notif.chat.isGroupChat
          ? `New message in ${notif.chat.name}`
          : `New message from ${getSender(user, notif.chat.users)}`,
        {
          onClick: () => handleNotificationClick(notif),
        }
      );
    });
    setShowNotification(false); // Hide notification badge after clicking
  };

  useEffect(() => {
    if (notification.length > 0) {
      setShowNotification(true); // Show notification badge if there are new notifications
    }
  }, [notification]);

  return (
    <>
      <Box className="flex justify-between items-center bg-white w-full border-b-2 border-gray-200 px-[10px] py-[5px]">
        <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <FaSearch />
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" textColor="black">
          Chatify
        </Text>

        <div>
          <Button onClick={showNotificationToast} p={1}>
            <Box position="relative">
              <BellIcon textColor="black" fontSize="2xl" m={1} />
              {showNotification && (
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  width="10px"
                  height="10px"
                  borderRadius="50%"
                  bg="red.500"
                />
              )}
            </Box>
          </Button>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem textColor="black">My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem textColor="black" onClick={logoutHandler}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb={4}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
              <Button onClick={handleSearch} isLoading={loading}>
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResults?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <ToastContainer />
    </>
  );
};

export default SideDrawer;
