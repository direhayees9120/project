import mongoose from "mongoose";
import Companies from "../models/companiesModel.js";
import { response } from "express";
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name) {
    return next("Company Name is required");
  }

  if (!email) {
    return next("Email address is required");
  }

  if (!password) {
    return next(
      "Password is required and must be grater than 6 characters long"
    );
  }
  try {
    const accountExist = await Companies.findOne({ email });

    if (accountExist) {
      return next("Email Already Registered. Please Login");
    }

    // create a new account
    const Company = await Companies.create({
      name,
      email,
      password,
    });
    // user token
    const token = Company.createJWT();
    res.status(201).json({
      success: true,
      message: "Company Account Created Successfully ",
      user: {
        _id: Company._id,
        name: Company.name,
        email: Company.email,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    resizeBy.status(400).json({ message: error.message });
  }
};

import Company from "../models/companiesModel.js"; // Import the Company model

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate email and password
    if (!email || !password) {
      return next("Please Provide A User Credentials");
    }

    // Find company by email
    const company = await Company.findOne({ email }).select("+password");

    // If company doesn't exist
    if (!company) {
      return next("Company not found");
    }

    // Compare the provided password with the stored password (assuming bcrypt is used)
    const isMatch = await company.comparePassword(password); // Assuming the model has a comparePassword method

    if (!isMatch) {
      return next("Invalid email or password");
    }

    // Remove the password from the response object
    company.password = undefined;

    // Create a JWT token
    const token = company.createJWT(); // Assuming the model has a createJWT method

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      user: company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const company = await Companies.findById({ _id: id });

    if (!company) {
      return res.status(200).send({
        message: "Company Not Found",
        success: false,
      });
    }

    company.password = undefined;
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

//GET ALL COMPANIES
export const getCompanies = async (req, res, next) => {
  try {
    const { search, sort, location, page = 1, limit = 20 } = req.query;
    const queryObject = {};

    if (search) {
      queryObject.name = { $regex: search, $options: "i" };
    }

    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    let queryResult = Companies.find(queryObject).select("-password");

    // Sorting
    if (sort === "Newest") queryResult = queryResult.sort("-createdAt");
    if (sort === "Oldest") queryResult = queryResult.sort("createdAt");
    if (sort === "A-Z") queryResult = queryResult.sort("name");
    if (sort === "Z-A") queryResult = queryResult.sort("-name");

    const total = await Companies.countDocuments(queryObject);
    const numOfPages = Math.ceil(total / limit);
    const companies = await queryResult.skip((page - 1) * limit).limit(limit);

    res.status(200).json({
      success: true,
      total,
      data: companies,
      page: Number(page),
      numOfPages,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

// GET SINGLE COMPANY
export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const company = await Companies.findById(id).populate({
      path: "jobPosts",
      options: { sort: "-_id" },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.password = undefined;

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

//GET  COMPANY JOBS
export const getCompanyJobListing = async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    const companyId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const queryOptions = { path: "jobPosts" };
    if (sort === "Newest") queryOptions.options = { sort: "-createdAt" };
    if (sort === "Oldest") queryOptions.options = { sort: "createdAt" };
    if (sort === "A-Z") queryOptions.options = { sort: "name" };
    if (sort === "Z-A") queryOptions.options = { sort: "-name" };

    const company = await Companies.findById(companyId).populate(queryOptions);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      success: true,
      data: company.jobPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  const { name, contact, location, profileUrl, about } = req.body;

  try {
    // validation
    if (!name || !location || !about || !contact || !profileUrl) {
      return next("Please Provide All Required Fields");
    }

    // Accessing user ID from req.user, not req.body.user
    const id = req.user._id; // Use req.user._id

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const updateCompany = {
      name,
      contact,
      location,
      profileUrl,
      about,
      _id: id,
    };

    const company = await Companies.findByIdAndUpdate(id, updateCompany, {
      new: true,
    });

    const token = company.createJWT();

    company.password = undefined;

    res.status(200).json({
      success: true,
      message: "Company Profile Updated Successfully",
      company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};








