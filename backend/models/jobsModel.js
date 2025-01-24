import mongoose, { Schema } from "mongoose";

const jobSchema = new mongoose.Schema({
    company : {type: Schema.Types.ObjectId, ref: "Companies"},
    jobTitle: {type: String, required: [true, "Job Title is required"]},
    jobType: {type: String, required: [true, "Job Type is required"]},
    salary: {type: String, required: [true, "Salary is required"]},
    vacancies: {type: Number},
    experience: {type: Number, default: 0},
    details:  [{desc: {type: String}, requirement: {type: String}}],
    applicants: [{type: Schema.Types.ObjectId, ref: "Users"}],
},
{timestamps: true}
);

const Jobs = mongoose.model("Jobs", jobSchema);

export default Jobs;
