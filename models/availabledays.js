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

async function findAll() {
  const query = {
    text: `
        SELECT * 
        FROM available_days
        ORDER BY date;
        `,
    values: [],
  };

  const res = await db.query(query);

  return res.rows;
}

export default {
  create,
  findAll,
};
