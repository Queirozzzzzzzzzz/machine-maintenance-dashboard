import db from "infra/database";

async function create(values) {
  const query = {
    text: `
        INSERT INTO maintenances (machine, role, criticality, responsible, problem, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
    values: [
      values.machine,
      values.role,
      values.criticality,
      values.responsible,
      values.problem,
      values.expires_at,
    ],
  };

  const res = await db.query(query);

  return res.rows[0];
}

async function update(id, values) {
  const currentMaintenance = await findById(id);
  const newData = { ...currentMaintenance, ...values };

  const query = {
    text: `
        UPDATE maintenances
        SET 
            machine = $2, 
            role = $3,
            criticality = $4, 
            responsible = $5, 
            problem = $6,
            expires_at = $7
        WHERE id = $1
        RETURNING *;
    `,
    values: [
      id,
      newData.machine,
      newData.role,
      newData.criticality,
      newData.responsible,
      newData.problem,
      newData.expires_at,
    ],
  };

  const res = await db.query(query);
  return res.rows[0];
}

async function removeById(id) {
  const query = {
    text: `
        DELETE FROM maintenances
        WHERE id = $1
        RETURNING *;
        `,
    values: [id],
  };

  const res = await db.query(query);

  return res.rows[0];
}

async function findById(id) {
  const query = {
    text: `
        SELECT *
        FROM maintenances
        WHERE id = $1;
    `,
    values: [id],
  };

  const res = await db.query(query);
  return res.rows[0];
}

async function findByUserId(userId) {
  const query = {
    text: `
        SELECT *
        FROM maintenances
        WHERE responsible = $1;
    `,
    values: [userId],
  };

  const res = await db.query(query);
  return res.rows[0];
}

async function findAll() {
  const res = await db.query("SELECT * FROM maintenances;");

  return res.rows;
}

export default {
  create,
  update,
  removeById,
  findById,
  findByUserId,
  findAll,
};
