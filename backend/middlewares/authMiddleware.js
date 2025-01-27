import jwt from "jsonwebtoken";
import Companies from "../models/companiesModel.js";
import Users from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Check if the user is a company or a regular user
    let entity;
    if (decoded.role === 'user') {
      // If it's a user, try to find it in the Users collection
      entity = await Users.findById(decoded.userId);
    } else if (decoded.role === 'company') {
      // If it's a company, try to find it in the Companies collection
      entity = await Companies.findById(decoded.userId);
    }

    if (!entity) {
      return res.status(404).json({ message: "User or company not found" });
    }

    // Attach the found user or company to the request
    req.user = entity;

    // Proceed to the next middleware/controller
    next();
  } catch (error) {
    console.log("Token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default userAuth;
