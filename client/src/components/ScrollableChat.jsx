import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import {
  isAvatarVisible,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { Avatar, Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
      <ScrollableFeed>
        {messages &&
          messages.map((msg, index) => (
            <div key={msg._id} style={{ display: "flex" }}>
              {isAvatarVisible(messages, index, user._id) && (
                <Tooltip
                  label={msg.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={msg.sender.name}
                    src={msg.sender.pic}
                    marginTop={
                      isSameUser(messages, msg, index, user._id) ? 5 : 15
                    }
                  />
                </Tooltip>
              )}

              <span
                style={{
                  backgroundColor: `${
                    msg.sender._id === user._id ? "#3182CE" : "rgb(251, 69, 99)"
                  }`,
                  color: "white",
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  marginLeft: isSameSenderMargin(
                    messages,
                    msg,
                    index,
                    user._id
                  ),
                  marginTop: isSameUser(messages, msg, index, user._id)
                    ? 5
                    : 15,
                }}
              >
                {msg.content}
              </span>
            </div>
          ))}
      </ScrollableFeed>
  );
};

export default ScrollableChat;
