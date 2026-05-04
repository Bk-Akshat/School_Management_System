const API_BASE_URL = "http://localhost:5000/api";

const form = document.getElementById("student-form");
const formTitle = document.getElementById("form-title");
const recordIdInput = document.getElementById("record-id");
const studentsBody = document.getElementById("students-body");
const resetBtn = document.getElementById("reset-btn");
const classFilter = document.getElementById("class-filter");
const sectionFilter = document.getElementById("section-filter");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");
const toast = document.getElementById("toast");
const pagination = document.getElementById("pagination");
const detailsModal = document.getElementById("details-modal");
const closeModalBtn = document.getElementById("close-modal");
const modalContent = document.getElementById("modal-content");
const themeToggle = document.getElementById("theme-toggle");
const totalStudentsEl = document.getElementById("total-students");
const paidFeesEl = document.getElementById("paid-fees");
const pendingFeesEl = document.getElementById("pending-fees");
const avgAttendanceEl = document.getElementById("avg-attendance");
const loaderOverlay = document.getElementById("loader-overlay");
const successPopup = document.getElementById("success-popup");
const entryModal = document.getElementById("entry-modal");
const addEntryBtn = document.getElementById("add-entry-btn");
const closeEntryModalBtn = document.getElementById("close-entry-modal");
const deletePopup = document.getElementById("delete-popup");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const popupTitle = document.getElementById("popup-title");
const popupMessage = document.getElementById("popup-message");
const popupOkBtn = document.getElementById("popup-ok-btn");
const popupCard = successPopup.querySelector(".popup-card");

const state = {
  editId: null,
  students: [],
  currentPage: 1,
  pageSize: 6
};
let pendingDeleteId = null;

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? "#dc2626" : "#111827";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function setLoading(isLoading) {
  loaderOverlay.classList.toggle("hidden", !isLoading);
}

function showSuccessPopup(message) {
  popupTitle.textContent = "Success";
  popupMessage.textContent = message;
  popupCard.classList.remove("error");
  successPopup.classList.remove("hidden");
}

function openEntryModal() {
  entryModal.classList.remove("hidden");
}

function closeEntryModal() {
  entryModal.classList.add("hidden");
}

function openDeletePopup(id) {
  pendingDeleteId = id;
  deletePopup.classList.remove("hidden");
}

function closeDeletePopup() {
  pendingDeleteId = null;
  deletePopup.classList.add("hidden");
}

function showErrorPopup(message) {
  popupTitle.textContent = "Error";
  popupMessage.textContent = message;
  popupCard.classList.add("error");
  successPopup.classList.remove("hidden");
}

function getErrorMessage(error) {
  if (error?.name === "AbortError") return "Request timed out. Please try again.";
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });
}

function setError(field, message) {
  const el = document.querySelector(`[data-error-for="${field}"]`);
  if (el) el.textContent = message;
}

function getFormData() {
  return {
    student_id: document.getElementById("student_id").value.trim(),
    full_name: document.getElementById("full_name").value.trim(),
    class: document.getElementById("class").value.trim(),
    section: document.getElementById("section").value.trim(),
    roll_number: Number(document.getElementById("roll_number").value),
    date_of_birth: document.getElementById("date_of_birth").value,
    gender: document.getElementById("gender").value,
    phone_number: document.getElementById("phone_number").value.trim(),
    address: document.getElementById("address").value.trim(),
    parent_name: document.getElementById("parent_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    admission_date: document.getElementById("admission_date").value,
    fees_status: document.getElementById("fees_status").value,
    attendance_percentage: document.getElementById("attendance_percentage").value
      ? Number(document.getElementById("attendance_percentage").value)
      : 0
  };
}

function validateForm(data) {
  clearErrors();
  let valid = true;

  const requiredFields = [
    "student_id",
    "full_name",
    "class",
    "section",
    "roll_number",
    "date_of_birth",
    "gender",
    "phone_number",
    "address",
    "parent_name"
  ];

  requiredFields.forEach((field) => {
    if (!data[field] && data[field] !== 0) {
      setError(field, "This field is required.");
      valid = false;
    }
  });

  if (data.roll_number < 1) {
    setError("roll_number", "Roll number must be greater than 0.");
    valid = false;
  }

  if (!/^\d{10}$/.test(data.phone_number)) {
    setError("phone_number", "Phone number must be 10 digits.");
    valid = false;
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    setError("email", "Please enter a valid email address.");
    valid = false;
  }

  if (data.attendance_percentage < 0 || data.attendance_percentage > 100) {
    showToast("Attendance should be between 0 and 100.", true);
    valid = false;
  }

  return valid;
}

async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
      signal: controller.signal
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || `Request failed with status ${response.status}.`);
    }
    return payload;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  } finally {
    clearTimeout(timeout);
  }
}

function fillFilterOptions(students) {
  const classes = [...new Set(students.map((s) => s.class))].sort();
  const sections = [...new Set(students.map((s) => s.section))].sort();

  classFilter.innerHTML = '<option value="">All Classes</option>';
  sectionFilter.innerHTML = '<option value="">All Sections</option>';

  classes.forEach((item) => {
    classFilter.innerHTML += `<option value="${item}">${item}</option>`;
  });
  sections.forEach((item) => {
    sectionFilter.innerHTML += `<option value="${item}">${item}</option>`;
  });
}

function createRow(student) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td data-label="Student ID">${student.student_id}</td>
    <td data-label="Name">${student.full_name}</td>
    <td data-label="Class">${student.class}</td>
    <td data-label="Section">${student.section}</td>
    <td data-label="Roll">${student.roll_number}</td>
    <td data-label="Phone">${student.phone_number}</td>
    <td data-label="Parent">${student.parent_name}</td>
    <td data-label="Actions">
      <div class="actions">
        <button class="btn view" data-action="view" data-id="${student.id}">View</button>
        <button class="btn edit" data-action="edit" data-id="${student.id}">Edit</button>
        <button class="btn delete" data-action="delete" data-id="${student.id}">Delete</button>
      </div>
    </td>
  `;
  return row;
}

function renderPagination(totalItems) {
  pagination.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));

  for (let page = 1; page <= totalPages; page += 1) {
    const btn = document.createElement("button");
    btn.textContent = page;
    btn.classList.toggle("active", page === state.currentPage);
    btn.addEventListener("click", () => {
      state.currentPage = page;
      renderTable(state.students);
    });
    pagination.appendChild(btn);
  }
}

function updateStats(students) {
  const total = students.length;
  const paid = students.filter((s) => s.fees_status === "Paid").length;
  const pending = students.filter((s) => s.fees_status !== "Paid").length;
  const avg =
    total > 0
      ? (students.reduce((sum, s) => sum + Number(s.attendance_percentage || 0), 0) / total).toFixed(1)
      : "0.0";

  animateCounter(totalStudentsEl, total, false);
  animateCounter(paidFeesEl, paid, false);
  animateCounter(pendingFeesEl, pending, false);
  animateCounter(avgAttendanceEl, Number(avg), true);
}

function animateCounter(element, targetValue, isPercent = false) {
  const raw = String(element.textContent || "0").replace("%", "");
  const startValue = Number.parseFloat(raw) || 0;
  const duration = 700;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = startValue + (targetValue - startValue) * eased;
    const output = isPercent ? `${value.toFixed(1)}%` : `${Math.round(value)}`;
    element.textContent = output;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function renderTable(students) {
  studentsBody.innerHTML = "";
  if (!students.length) {
    studentsBody.innerHTML = '<tr><td class="empty" colspan="8">No student records found.</td></tr>';
    pagination.innerHTML = "";
    return;
  }

  const startIndex = (state.currentPage - 1) * state.pageSize;
  const pagedStudents = students.slice(startIndex, startIndex + state.pageSize);

  pagedStudents.forEach((student) => {
    studentsBody.appendChild(createRow(student));
  });

  renderPagination(students.length);
}

async function loadStudents() {
  const [sortBy, sortOrder] = sortSelect.value.split(":");
  const params = new URLSearchParams();

  if (searchInput.value.trim()) params.append("search", searchInput.value.trim());
  if (classFilter.value) params.append("class", classFilter.value);
  if (sectionFilter.value) params.append("section", sectionFilter.value);
  params.append("sortBy", sortBy);
  params.append("sortOrder", sortOrder);

  const query = params.toString() ? `?${params.toString()}` : "";
  const students = await apiRequest(`/students${query}`);
  state.students = students;
  state.currentPage = 1;
  fillFilterOptions(students);
  updateStats(students);
  renderTable(students);
}

function resetForm() {
  state.editId = null;
  recordIdInput.value = "";
  form.reset();
  clearErrors();
  formTitle.textContent = "Add New Student";
  document.getElementById("submit-btn").textContent = "Submit";
}

function setFormValues(student) {
  recordIdInput.value = student.id;
  document.getElementById("student_id").value = student.student_id;
  document.getElementById("full_name").value = student.full_name;
  document.getElementById("class").value = student.class;
  document.getElementById("section").value = student.section;
  document.getElementById("roll_number").value = student.roll_number;
  document.getElementById("date_of_birth").value = student.date_of_birth;
  document.getElementById("gender").value = student.gender;
  document.getElementById("phone_number").value = student.phone_number;
  document.getElementById("address").value = student.address;
  document.getElementById("parent_name").value = student.parent_name;
  document.getElementById("email").value = student.email || "";
  document.getElementById("admission_date").value = student.admission_date || "";
  document.getElementById("fees_status").value = student.fees_status || "Pending";
  document.getElementById("attendance_percentage").value = student.attendance_percentage ?? 0;

  formTitle.textContent = "Edit Student";
  document.getElementById("submit-btn").textContent = "Update";
  openEntryModal();
}

function showStudentDetails(student) {
  modalContent.innerHTML = `
    <p><strong>Student ID</strong>${student.student_id}</p>
    <p><strong>Full Name</strong>${student.full_name}</p>
    <p><strong>Class</strong>${student.class}</p>
    <p><strong>Section</strong>${student.section}</p>
    <p><strong>Roll Number</strong>${student.roll_number}</p>
    <p><strong>DOB</strong>${student.date_of_birth}</p>
    <p><strong>Gender</strong>${student.gender}</p>
    <p><strong>Phone</strong>${student.phone_number}</p>
    <p><strong>Parent</strong>${student.parent_name}</p>
    <p><strong>Email</strong>${student.email || "-"}</p>
    <p><strong>Address</strong>${student.address}</p>
    <p><strong>Fees Status</strong>${student.fees_status || "Pending"}</p>
    <p><strong>Attendance</strong>${student.attendance_percentage ?? 0}%</p>
    <p><strong>Admission Date</strong>${student.admission_date || "-"}</p>
  `;
  detailsModal.classList.remove("hidden");
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggle.innerHTML =
    theme === "dark"
      ? '<i class="fa-solid fa-sun"></i> Light Mode'
      : '<i class="fa-solid fa-moon"></i> Dark Mode';
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = getFormData();

  if (!validateForm(data)) return;

  setLoading(true);
  try {
    if (state.editId) {
      await apiRequest(`/update-student/${state.editId}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      showSuccessPopup("Student data updated successfully.");
    } else {
      await apiRequest("/add-student", {
        method: "POST",
        body: JSON.stringify(data)
      });
      showSuccessPopup("Student data saved successfully.");
    }

    resetForm();
    closeEntryModal();
    await loadStudents();
  } catch (error) {
    showErrorPopup(getErrorMessage(error));
  } finally {
    setLoading(false);
  }
});

studentsBody.addEventListener("click", async (event) => {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;
  if (!action || !id) return;

  if (action === "edit") {
    try {
      const student = await apiRequest(`/students/${id}`);
      state.editId = id;
      setFormValues(student);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      showErrorPopup(getErrorMessage(error));
    }
  }

  if (action === "view") {
    try {
      const student = await apiRequest(`/students/${id}`);
      showStudentDetails(student);
    } catch (error) {
      showErrorPopup(getErrorMessage(error));
    }
  }

  if (action === "delete") {
    openDeletePopup(id);
  }
});

addEntryBtn.addEventListener("click", () => {
  resetForm();
  openEntryModal();
});
resetBtn.addEventListener("click", resetForm);
closeEntryModalBtn.addEventListener("click", closeEntryModal);
entryModal.addEventListener("click", (event) => {
  if (event.target === entryModal) closeEntryModal();
});

confirmDeleteBtn.addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  setLoading(true);
  try {
    await apiRequest(`/delete-student/${pendingDeleteId}`, { method: "DELETE" });
    if (String(state.editId) === String(pendingDeleteId)) resetForm();
    closeDeletePopup();
    showSuccessPopup("Student deleted successfully.");
    await loadStudents();
  } catch (error) {
    showErrorPopup(getErrorMessage(error));
  } finally {
    setLoading(false);
  }
});

cancelDeleteBtn.addEventListener("click", closeDeletePopup);
deletePopup.addEventListener("click", (event) => {
  if (event.target === deletePopup) closeDeletePopup();
});
popupOkBtn.addEventListener("click", () => successPopup.classList.add("hidden"));
closeModalBtn.addEventListener("click", () => detailsModal.classList.add("hidden"));
detailsModal.addEventListener("click", (event) => {
  if (event.target === detailsModal) detailsModal.classList.add("hidden");
});
successPopup.addEventListener("click", (event) => {
  if (event.target === successPopup) successPopup.classList.add("hidden");
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
});

[searchInput, classFilter, sectionFilter, sortSelect].forEach((el) => {
  el.addEventListener("input", () => {
    loadStudents().catch((error) => showErrorPopup(getErrorMessage(error)));
  });
  el.addEventListener("change", () => {
    loadStudents().catch((error) => showErrorPopup(getErrorMessage(error)));
  });
});

window.addEventListener("error", (event) => {
  showErrorPopup(getErrorMessage(event.error));
});

window.addEventListener("unhandledrejection", (event) => {
  showErrorPopup(getErrorMessage(event.reason));
});

applyTheme(localStorage.getItem("theme") || "light");
loadStudents().catch((error) => showErrorPopup(getErrorMessage(error)));
