// Function to get the sender's name
export const getSender = (loggedUser, users) => {
  if (!users || users.length < 2) return "";
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

// Function to get the sender's full details
export const getSenderFull = (loggedUser, users) => {
  if (!users || users.length < 2) return null;
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

// Check if the current message is the first message of a new user in the conversation
export const isFirstMessageOfNewUser = (messages, index, userId) => {
  return (
    index === 0 ||
    (messages[index].sender._id !== messages[index - 1]?.sender._id &&
      messages[index].sender._id !== userId)
  );
};

// Determine the margin for the current message
export const isSameSenderMargin = (messages, msg, index, userId) => {
  // Check if the next message is from the same sender and not the logged-in user
  if (
    index < messages.length - 1 &&
    messages[index + 1]?.sender?._id === msg.sender._id &&
    msg.sender._id !== userId
  ) {
    return 5; // Small margin for subsequent messages from the same sender
  } else if (msg.sender._id !== userId) {
    // For all other cases where the avatar is not shown and the sender is not the logged-in user
    return 10; // Consistent margin for alignment
  } else {
    return "auto"; // No margin for the logged-in user's messages
  }
};

// Check if the avatar should be visible
export const isAvatarVisible = (messages, index, userId) => {
  return (
    (index === 0 && messages[index].sender._id !== userId) || // Show avatar if it's the first message and not from the logged-in user
    (index > 0 &&
      messages[index].sender._id !== messages[index - 1]?.sender._id &&
      messages[index].sender._id !== userId) // Show avatar if the sender has changed and it's not the logged-in user
  );
};

// Determine if the current message is from the same user as the next message
export const isSameUser = (messages, msg, index, userId) => {
  return index > 0 && messages[index - 1]?.sender?._id === msg.sender?._id;
};
