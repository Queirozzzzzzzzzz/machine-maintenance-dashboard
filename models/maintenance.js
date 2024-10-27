async function create(values) {
  const query = {
    text: `
        INSERT INTO maintenances (machine, criticality, responsible, problem)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
    values: [
      values.machine,
      values.criticality,
      values.responsible,
      values.problem,
    ],
  };

  const res = await db.query(query);
  return res.rows[0];
}

async function update(id, values) {
  const query = {
    text: `
        UPDATE maintenances
        SET 
            machine = $2, 
            criticality = $3, 
            responsible = $4, 
            problem = $5
        WHERE id = $1
        RETURNING *;
    `,
    values: [
      id,
      values.machine,
      values.criticality,
      values.responsible,
      values.problem,
    ],
  };

  const res = await db.query(query);
  return res.rows[0];
}

async function remove(id) {
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
  remove,
  findById,
  findByUserId,
  findAll,
};
