import db from "infra/database";

async function create(date) {
  const query = {
    text: `
        INSERT INTO available_days (date)
        VALUES ($1)
        RETURNING *;
        `,
    values: [date],
  };

  const res = await db.query(query);

  return res.rows[0];
}

async function removeById(id) {
  const query = {
    text: `
        DELETE FROM available_days
        WHERE id = $1
        RETURNING *;
        `,
    values: [id],
  };

  const res = await db.query(query);

  return res.rows[0];
}

async function removeByDate(date) {
  const query = {
    text: `
          DELETE FROM available_days
          WHERE date = $1
          RETURNING *;
          `,
    values: [id],
  };

  const res = await db.query(query);

  return res.rows[0];
}

export default {
  create,
  removeById,
  removeByDate,
};
