const Student = require("../models/Student");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilters(query) {
  const filters = {};

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), "i");
    filters.$or = [
      { student_id: regex },
      { full_name: regex },
      { phone_number: regex },
      { parent_name: regex }
    ];
  }

  if (query.class) {
    filters.class = query.class;
  }

  if (query.section) {
    filters.section = query.section;
  }

  return filters;
}

function resolveSort(query) {
  const allowedSortColumns = {
    name: "full_name",
    class: "class",
    roll: "roll_number",
    created_at: "created_at"
  };

  const sortBy = allowedSortColumns[query.sortBy] || "created_at";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  return { [sortBy]: sortOrder };
}

function toResponseStudent(studentDoc) {
  const student = studentDoc.toObject ? studentDoc.toObject() : studentDoc;
  const { _id, __v, ...rest } = student;

  return {
    ...rest,
    id: String(_id)
  };
}

function isDuplicateKeyError(error) {
  return error?.code === 11000;
}

function isInvalidObjectIdError(error) {
  return error?.name === "CastError";
}

exports.getStudents = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const sort = resolveSort(req.query);

    const students = await Student.find(filters).sort(sort);
    return res.status(200).json(students.map(toResponseStudent));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch students.", error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(200).json(toResponseStudent(student));
  } catch (error) {
    if (isInvalidObjectIdError(error)) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(500).json({ message: "Failed to fetch student.", error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      email: req.body.email || null,
      admission_date: req.body.admission_date || null,
      fees_status: req.body.fees_status || "Pending",
      attendance_percentage: req.body.attendance_percentage || 0
    };

    const student = await Student.create(studentData);

    return res.status(201).json({
      message: "Student created successfully.",
      id: String(student._id)
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "Student ID already exists." });
    }

    return res.status(500).json({ message: "Failed to create student.", error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      email: req.body.email || null,
      admission_date: req.body.admission_date || null,
      fees_status: req.body.fees_status || "Pending",
      attendance_percentage: req.body.attendance_percentage || 0
    };

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, studentData, {
      new: true,
      runValidators: true
    });

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(200).json({ message: "Student updated successfully." });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "Student ID already exists." });
    }
    if (isInvalidObjectIdError(error)) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(500).json({ message: "Failed to update student.", error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    if (isInvalidObjectIdError(error)) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(500).json({ message: "Failed to delete student.", error: error.message });
  }
};
