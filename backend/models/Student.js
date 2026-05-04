const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    student_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    full_name: {
      type: String,
      required: true,
      trim: true
    },
    class: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      required: true,
      trim: true
    },
    roll_number: {
      type: Number,
      required: true,
      min: 1
    },
    date_of_birth: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"]
    },
    phone_number: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    parent_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      default: null,
      trim: true
    },
    admission_date: {
      type: String,
      default: null
    },
    fees_status: {
      type: String,
      enum: ["Paid", "Pending", "Partially Paid"],
      default: "Pending"
    },
    attendance_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

module.exports = mongoose.model("Student", studentSchema);
