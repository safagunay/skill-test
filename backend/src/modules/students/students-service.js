const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const {
  findAllStudents,
  findStudentDetail,
  findStudentToSetStatus,
  addStudent,
  updateStudent,
} = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
  const isStudentFound = await findUserById(id);
  if (!isStudentFound) {
    throw new ApiError(404, "Student not found");
  }
};

const getAllStudents = async (payload) => {
  const students = await findAllStudents(payload);
  if (students.length <= 0) {
    throw new ApiError(404, "Students not found");
  }

  return students;
};

const getStudentDetail = async (id) => {
  await checkStudentId(id);

  const student = await findStudentDetail(id);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return student;
};

const addNewStudent = async (payload) => {
  const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS =
    "Student added and verification email sent successfully.";
  const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL =
    "Student added, but failed to send verification email.";
  try {
    const result = await addStudent(payload);
    if (!result.id) {
      throw new ApiError(500);
    }

    try {
      await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
      return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS, id: result.id };
    } catch (error) {
      return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL, id: result.id };
    }
  } catch (error) {
    throw new ApiError(500, "Unable to add student");
  }
};

const updateStudentWithId = async (payload) => {
  try {
    await updateStudent(payload);
    return { message: "Student updated successfully." };
  } catch {
    throw new ApiError(500, "Unable to update student");
  }
};

const setStudentStatus = async ({ userId, reviewerId, status }) => {
  await checkStudentId(userId);

  const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
  if (affectedRow <= 0) {
    throw new ApiError(500, "Unable to disable student");
  }

  return { message: "Student status changed successfully" };
};

module.exports = {
  getAllStudents,
  getStudentDetail,
  addNewStudent,
  updateStudentWithId,
  setStudentStatus,
};
