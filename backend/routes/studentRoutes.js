const express = require("express");
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require("../controllers/studentController");

const router = express.Router();

router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.post("/add-student", createStudent);
router.put("/update-student/:id", updateStudent);
router.delete("/delete-student/:id", deleteStudent);

module.exports = router;
