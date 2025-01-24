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

    // Try to find the user in both collections
    const user = await Users.findById(decoded.userId);
    const company = await Companies.findById(decoded.userId);

    if (!user && !company) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user or company to the request
    req.user = user || company;

    // Proceed to the next middleware/controller
    next();
  } catch (error) {
    console.log("Token verification error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default userAuth;
