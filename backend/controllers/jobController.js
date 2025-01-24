import mongoose from "mongoose";
import Jobs from "../models/jobsModel.js";
import Companies from "../models/companiesModel.js";

export const createJob = async (req, res, next) => {
  const { jobTitle, jobType, location, salary, vacancies, experience, detail } = req.body;
  const companyId = req.user._id;

  // Log the request body to debug
  console.log("Request Body:", req.body);

  try {
    // Validation
    if (!jobTitle || !jobType || !location || !salary || !vacancies || !experience || !detail?.desc || !detail?.requirements) {
      return next("All fields are required");
    }

    // Check if the company exists
    const company = await Companies.findById(companyId);
    if (!company) {
      return next("Company not found");
    }

    // Create a new job document
    const newJob = await Jobs.create({
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      detail,
      company: companyId,
    });

    // Optionally, add the job to the company's jobPosts array
    company.jobPosts.push(newJob._id);
    await company.save();

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};



export const updateJob = async (req, res, next) => {
  const { jobTitle, jobType, location, salary, vacancies, experience, desc, requirements } = req.body;
  const { jobId } = req.params;
  
  if (!req.user) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  const companyId = req.user._id; // Access company ID from req.user

  if (!jobTitle || !jobType || !location || !salary || !vacancies || !experience || !desc || !requirements) {
    return next("Please provide all required fields");
  }

  try {
    // Validate the job post with the given jobId
    const job = await Jobs.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Update the job with the new values
    job.jobTitle = jobTitle;
    job.jobType = jobType;
    job.location = location;
    job.salary = salary;
    job.vacancies = vacancies;
    job.experience = experience;
    job.detail = { desc, requirements };
    job.company = companyId;

    await job.save(); // Save updated job

    res.status(200).json({
      success: true,
      message: "Job post updated successfully",
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


export const getJobPosts = async (req, res, next) => {
  try {
    const { search, sort, location, jtype, exp } = req.query;
    const types = jtype?.split(","); //full-time,part-time
    const experience = exp?.split("-"); //2-6

    let queryObject = {};

    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    if (jtype) {
      queryObject.jobType = { $in: types };
    }

    //    [2. 6]

    if (exp) {
      queryObject.experience = {
        $gte: Number(experience[0]) - 1,
        $lte: Number(experience[1]) + 1,
      };
    }

    if (search) {
      const searchQuery = {
        $or: [
          { jobTitle: { $regex: search, $options: "i" } },
          { jobType: { $regex: search, $options: "i" } },
        ],
      };
      queryObject = { ...queryObject, ...searchQuery };
    }

    let queryResult = Jobs.find(queryObject).populate({
      path: "company",
      select: "-password",
    });

    // SORTING
    if (sort === "Newest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "A-Z") {
      queryResult = queryResult.sort("jobTitle");
    }
    if (sort === "Z-A") {
      queryResult = queryResult.sort("-jobTitle");
    }

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    //records count
    const totalJobs = await Jobs.countDocuments(queryResult);
    const numOfPage = Math.ceil(totalJobs / limit);

    queryResult = queryResult.limit(limit * page);

    const jobs = await queryResult;

    res.status(200).json({
      success: true,
      totalJobs,
      data: jobs,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Jobs.findById({ _id: id }).populate({
      path: "company",
      select: "-password",
    });

    if (!job) {
      return res.status(200).send({
        message: "Job Post Not Found",
        success: false,
      });
    }

    //GET SIMILAR JOB POST
    const searchQuery = {
      $or: [
        { jobTitle: { $regex: job?.jobTitle, $options: "i" } },
        { jobType: { $regex: job?.jobType, $options: "i" } },
      ],
    };

    let queryResult = Jobs.find(searchQuery)
      .populate({
        path: "company",
        select: "-password",
      })
      .sort({ _id: -1 });

    queryResult = queryResult.limit(6);
    const similarJobs = await queryResult;

    res.status(200).json({
      success: true,
      data: job,
      similarJobs,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const deleteJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Jobs.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Job Post Deleted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};