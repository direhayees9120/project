import mongoose from "mongoose";
import Users from "../models/userModel.js";

export const updateUser = async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        location,
        jobTitle,
        profileUrl,
        about,
        contact,
    } = req.body;

    try {
        // 🛡️ Validate all fields
        if (!firstName || !lastName || !email || !location || !jobTitle || !profileUrl || !about || !contact) {
            return next("Please provide all required fields");
        }

        // 🆔 Get userId from authMiddleware (corrected to use _id)
        const id = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "User not found" });
        }

        // 📥 Update user data
        const updatedUser = await Users.findOneAndUpdate(
            { _id: id }, // Query
            {
                firstName,
                lastName,
                email,
                location,
                jobTitle,
                profileUrl,
                about,
                contact,
            }, // Update
            { new: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = updatedUser.createJWT();

        updatedUser.password = undefined; // Remove password from response

        // 📤 Send updated user details
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
            token,
        });

    } catch (error) {
        console.error(error);
        next(error); // Pass the error to error middleware
    }
};



export const getUser = async (req, res, next) => {
    try {
        // 🆔 Get userId from authMiddleware (req.user should be populated by authMiddleware)
        const id = req.user._id;

        // 🗂️ Fetch the user by ID
        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        user.password = undefined; // Remove password from response

        // 📤 Send user details
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error.message,
        });
    }
};

  
    export default { updateUser, getUser };