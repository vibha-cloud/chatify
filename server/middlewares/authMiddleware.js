import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token; // Initialize token variable

  // Check if the authorization header is present and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Split the authorization header to get the token
      token = req.headers.authorization.split(" ")[1];
      // Example: "Bearer fhjeksiorehe" -> ["Bearer", "fhjeksiorehe"]

      // Verify the token using the secret key from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by decoded id from the token and exclude the password field
      req.user = await User.findById(decoded.id).select("-password");

      // Call the next middleware or route handler
      next();
    } catch (error) {
      console.error(error); // Log any error
      res.status(401); // Set the response status to 401 (Unauthorized)
      throw new Error("Not authorized, token failed"); // Throw an error to be handled by error middleware
    }
  } else {
    res.status(401); // Set the response status to 401 (Unauthorized)
    throw new Error("Not authorized, no token"); // Throw an error if no token is provided
  }
});

export { protect };
