const asyncHandler = require("express-async-handler");
const {
  getAllStudents,
  addNewStudent,
  getStudentDetail,
  setStudentStatus,
  updateStudentWithId,
} = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
  const students = await getAllStudents(req.body);
  res.json({ students });
});

const handleAddStudent = asyncHandler(async (req, res) => {
  const result = await addNewStudent(req.body);
  res.json(result);
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
  const {id: studentId} = req.params;

  const result = await updateStudentWithId({
    id: studentId,
    ...req.body
  });
  res.json(result);
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
  const {id: studentId} = req.params;

  const student = await getStudentDetail(studentId);
  
  res.json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
  const {id: studentId} = req.params;

  const {id: reviewerId, status} = req.body;

  const result = await setStudentStatus({userId: studentId, reviewerId, status });

  res.json(result);
});

module.exports = {
  handleGetAllStudents,
  handleGetStudentDetail,
  handleAddStudent,
  handleStudentStatus,
  handleUpdateStudent,
};
