const { processDBRequest } = require("../../utils");

const getRoleId = async (roleName) => {
  const query = "SELECT id FROM roles WHERE name ILIKE $1";
  const queryParams = [roleName];
  const { rows } = await processDBRequest({ query, queryParams });
  return rows[0].id;
};

const findAllStudents = async (payload) => {
  const { name, className, section, roll } = payload;
  let query = `
        SELECT
            t1.id,
            t1.name,
            t1.email,
            t1.last_login AS "lastLogin",
            t1.is_active AS "systemAccess",
            t4.name AS "role"
        FROM users t1
        LEFT JOIN user_profiles t3 ON t1.id = t3.user_id
        LEFT JOIN roles t4 ON t1.role_id = t4.id
        WHERE t1.role_id = 3`;
  let queryParams = [];
  if (name) {
    query += ` AND t1.name = $${queryParams.length + 1}`;
    queryParams.push(name);
  }
  if (className) {
    query += ` AND t3.class_name = $${queryParams.length + 1}`;
    queryParams.push(className);
  }
  if (section) {
    query += ` AND t3.section_name = $${queryParams.length + 1}`;
    queryParams.push(section);
  }
  if (roll) {
    query += ` AND t3.roll = $${queryParams.length + 1}`;
    queryParams.push(roll);
  }

  query += " ORDER BY t1.id";

  const { rows } = await processDBRequest({ query, queryParams });
  return rows;
};

const addStudent = async (payload) => {
  const query = `
    WITH insert_user AS (
      INSERT INTO users (name, email, is_active, role_id)
      VALUES ($1, $2, $3, 3)
      RETURNING id
    ),
    insert_profile AS (
      INSERT INTO user_profiles (
        user_id, gender, phone, dob, class_name, section_name, roll,
        current_address, permanent_address, father_name, father_phone,
        mother_name, mother_phone, guardian_name, guardian_phone,
        relation_of_guardian, admission_dt
      )
      VALUES (
        (SELECT id FROM insert_user), $4, $5, $6, NULLIF($7, ''), NULLIF($8, ''),
        NULLIF($9, '')::INTEGER, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19
      )
    )
    SELECT * FROM insert_user;
  `;
  const queryParams = [
    payload.name,
    payload.email,
    payload.systemAccess,
    payload.gender,
    payload.phone,
    payload.dob,
    payload.class,
    payload.section,
    payload.roll,
    payload.currentAddress,
    payload.permanentAddress,
    payload.fatherName,
    payload.fatherPhone,
    payload.motherName,
    payload.motherPhone,
    payload.guardianName,
    payload.guardianPhone,
    payload.relationOfGuardian,
    payload.admissionDate,
  ];
  const { rows } = await processDBRequest({ query, queryParams });
  return rows[0];
};

const updateStudent = async (payload) => {
  const query = `
    WITH updated_user AS (
      UPDATE users
      SET
          name = $2,
          email = $3,
          is_active = $4
      WHERE id = $1
      RETURNING id
    )
    UPDATE user_profiles
    SET
        gender = $5,
        phone = $6,
        dob = $7,
        class_name = $8,
        section_name = NULLIF($9, ''),
        roll = $10,
        current_address = $11,
        permanent_address = $12,
        father_name = $13,
        father_phone = NULLIF($14, ''),
        mother_name = NULLIF($15, ''),
        mother_phone = NULLIF($16, ''),
        guardian_name = $17,
        guardian_phone = $18,
        relation_of_guardian = $19,
        admission_dt = $20
    WHERE user_id = (SELECT id FROM updated_user);
  `;
  const queryParams = [
    payload.id,
    payload.name,
    payload.email,
    payload.systemAccess,
    payload.gender,
    payload.phone,
    payload.dob,
    payload.class,
    payload.section,
    payload.roll,
    payload.currentAddress,
    payload.permanentAddress,
    payload.fatherName,
    payload.fatherPhone,
    payload.motherName,
    payload.motherPhone,
    payload.guardianName,
    payload.guardianPhone,
    payload.relationOfGuardian,
    payload.admissionDate,
  ];
  await processDBRequest({ query, queryParams });
};

const findStudentDetail = async (id) => {
  const query = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.is_active AS "systemAccess",
            p.phone,
            p.gender,
            p.dob,
            p.class_name AS "class",
            COALESCE(p.section_name, '') AS "section",
            CAST(p.roll AS TEXT) AS "roll",
            p.father_name AS "fatherName",
            COALESCE(p.father_phone, '') AS "fatherPhone",
            COALESCE(p.mother_name, '') AS "motherName",
            COALESCE(p.mother_phone, '') AS "motherPhone",
            p.guardian_name AS "guardianName",
            p.guardian_phone AS "guardianPhone",
            p.relation_of_guardian as "relationOfGuardian",
            p.current_address AS "currentAddress",
            p.permanent_address AS "permanentAddress",
            p.admission_dt AS "admissionDate",
            r.name as "reporterName"
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        LEFT JOIN users r ON u.reporter_id = r.id
        WHERE u.id = $1`;
  const queryParams = [id];
  const { rows } = await processDBRequest({ query, queryParams });
  return rows[0];
};

const findStudentToSetStatus = async ({ userId, reviewerId, status }) => {
  const now = new Date();
  const query = `
        UPDATE users
        SET
            is_active = $1,
            status_last_reviewed_dt = $2,
            status_last_reviewer_id = $3
        WHERE id = $4
    `;
  const queryParams = [status, now, reviewerId, userId];
  const { rowCount } = await processDBRequest({ query, queryParams });
  return rowCount;
};

const findStudentToUpdate = async (paylaod) => {
  const {
    basicDetails: { name, email },
    id,
  } = paylaod;
  const currentDate = new Date();
  const query = `
        UPDATE users
        SET name = $1, email = $2, updated_dt = $3
        WHERE id = $4;
    `;
  const queryParams = [name, email, currentDate, id];
  const { rows } = await processDBRequest({ query, queryParams });
  return rows;
};

module.exports = {
  getRoleId,
  findAllStudents,
  addStudent,
  updateStudent,
  findStudentDetail,
  findStudentToSetStatus,
  findStudentToUpdate,
};
