import Users from "../models/userModel.js";

export const register = async (req, res, next) => {
  console.log("backend");
  const { firstName, lastName, email, password } = req.body;

  // Validate fields
  if (!firstName) {
    return next(new Error("First Name is required"));
  }
  if (!email) {
    return next(new Error("Email is required"));
  }
  if (!lastName) {
    return next(new Error("Last Name is required"));
  }
  if (!password) {
    return next(new Error("Password is required"));
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      return next(new Error("Email Address already exists"));
    }

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password,
    });

    // Create token
    const token = user.createJWT();

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return next(new Error(error.message));  // Proper error forwarding
  }
};

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;
  
    try {
      // Validate email and password
      if (!email || !password) {
        return next("Please Provide A User Credentials");
      }
  
      // Find user by email
      const user = await Users.findOne({ email }).select("+password");
  
      if (!user) {
        return next("Invalid email or password");
      }
  
      // Compare password
      const isMatch = await user.comparePassword(password);
  
      if (!isMatch) {
        return next("Invalid email or password");
      }
  
      // Remove password from user object before sending response
      user.password = undefined;
  
      // Create JWT
      const token = user.createJWT();
  
      return res.status(200).json({
        success: true,
        message: "Login successfully",
        user,
        token,
      });
    } catch (error) {
      console.error("Error during login:", error); // Log the error to console
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message, // Include error message in response
      });
    }
  };
  