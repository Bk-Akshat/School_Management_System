-- Database: school_management
-- Table: students
-- Recreating this schema deletes all existing student records.

BEGIN TRANSACTION;

DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  class VARCHAR(20) NOT NULL,
  section VARCHAR(20) NOT NULL,
  roll_number INTEGER NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  phone_number VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  parent_name VARCHAR(120) NOT NULL,
  email VARCHAR(120),
  admission_date DATE,
  fees_status VARCHAR(20) DEFAULT 'Pending' CHECK (fees_status IN ('Paid', 'Pending', 'Partially Paid')),
  attendance_percentage DECIMAL(5,2) DEFAULT 0 CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

COMMIT;

-- Sample CRUD SQL statements:

-- CREATE
INSERT INTO students (
  student_id, full_name, class, section, roll_number, date_of_birth, gender,
  phone_number, address, parent_name, email, admission_date, fees_status, attendance_percentage
) VALUES (
  'STU-1001', 'Aarav Sharma', '10', 'A', 21, '2010-08-14', 'Male',
  '9876543210', 'Sector 4, Delhi', 'Rakesh Sharma', 'aarav@example.com', '2024-04-10', 'Pending', 89.5
);

-- READ
SELECT * FROM students;

-- UPDATE
UPDATE students
SET phone_number = '9998887776', fees_status = 'Paid', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- DELETE
DELETE FROM students WHERE id = 1;
