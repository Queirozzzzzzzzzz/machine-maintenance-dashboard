import db from "infra/database";
import authentication from "models/authentication";
import { ValidationError } from "errors";

async function create(data) {
  await validateUniqueEmail(data.email);
  await hashPasswordInObject(data);

  data.features = ["read:session", "read:user"];

  const query = {
    text: `INSERT INTO users (full_name, email, password, features, role) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
    values: [
      data.full_name,
      data.email,
      data.password,
      data.features,
      "technical",
    ],
  };

  const res = await db.query(query);
  const newUser = res.rows[0];

  return newUser;
}

async function update(id, data) {
  if (data.password) await hashPasswordInObject(data);
  const newData = [...user, ...data];

  const query = {
    text: `
    UPDATE users
    SET full_name = $2, email = $3, password = $4, updated_at = (now() at time zone 'utc')
    WHERE id = $1
    RETURNING *;`,
    values: [id, newData.full_name, newData.email, newData.password],
  };

  const result = await db.query(query);

  return result.rows[0];
}

async function createAdmin(data) {
  await validateUniqueEmail(data.email);
  await hashPasswordInObject(data);

  data.features = [
    "admin",
    "create:session",
    "read:session",
    "read:user",
    "read:users",
    "update:user",
    "update:user:others",
    "ban:user",
    "active",
  ];

  const query = {
    text: `INSERT INTO users (full_name, email, password, features, role) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
    values: [
      data.full_name,
      data.email,
      data.password,
      data.features,
      "manager",
    ],
  };

  const res = await db.query(query);
  const newUser = res.rows[0];

  return newUser;
}

function createAnonymous() {
  return {
    features: ["create:session", "create:user"],
  };
}

async function validateUniqueEmail(email) {
  const query = {
    text: "SELECT email FROM users WHERE LOWER(email) = LOWER($1)",
    values: [email],
  };

  const res = await db.query(query);

  if (res.rowCount > 0) {
    throw new ValidationError({
      message: `O "email" informado já está sendo usado.`,
      stack: new Error().stack,
      errorLocationCode: "MODEL:USER:VALIDATE_UNIQUE_EMAIL:ALREADY_EXISTS",
      key: "email",
    });
  }
}

async function hashPasswordInObject(userObj) {
  userObj.password = await authentication.hashPassword(userObj.password);
  return userObj;
}

async function findById(id) {
  const query = {
    text: `SELECT * FROM users WHERE id = $1;`,
    values: [id],
  };

  const res = await db.query(query);

  if (res.rowCount === 0) {
    throw new NotFoundError({
      message: `O id "${userId}" não foi encontrado no sistema.`,
      action: 'Verifique se o "id" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: "MODEL:USER:FIND_BY_ID:NOT_FOUND",
      key: "id",
    });
  }

  return res.rows[0];
}

async function findByEmail(email) {
  const query = {
    text: `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
    values: [email],
  };

  const res = await db.query(query);

  if (res.rowCount === 0) {
    throw new NotFoundError({
      message: `O email informado não foi encontrado no sistema.`,
      action: 'Verifique se o "email" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: "MODEL:USER:FIND_BY_EMAIL:NOT_FOUND",
      key: "email",
    });
  }

  return res.rows[0];
}

async function findByFullName(full_name) {
  const query = {
    text: `SELECT * FROM users WHERE LOWER(full_name) = LOWER($1) LIMIT 1;`,
    values: [full_name],
  };

  const res = await db.query(query);

  if (res.rowCount === 0) {
    throw new NotFoundError({
      message: `O usuário informado não foi encontrado no sistema.`,
      action: 'Verifique se o "usuário" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: "MODEL:USER:FIND_BY_EMAIL:NOT_FOUND",
      key: "email",
    });
  }

  return res.rows[0];
}

async function findByFeature(feature) {
  const query = {
    text: `
    SELECT *
    FROM users
    WHERE $1 = ANY(features);
  ;`,
    values: [feature],
  };

  const res = await db.query(query);

  return res.rows;
}

async function findByMissingFeature(feature) {
  const query = {
    text: `
    SELECT *
    FROM users
    WHERE NOT ($1 = ANY(features));
    `,
    values: [feature],
  };

  const res = await db.query(query);

  return res.rows;
}

async function findAll() {
  const res = await db.query("SELECT * FROM users;");

  return res.rows;
}

async function removeByEmail(email) {
  const query = {
    text: `
    DELETE FROM users
    WHERE email = $1
    RETURNING *;`,
    values: [email],
  };

  const result = await db.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: `O email informado não foi encontrado no sistema.`,
      action: 'Verifique se o "email" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: "MODEL:USER:REMOVE_BY_EMAIL:NOT_FOUND",
      key: "email",
    });
  }

  return result.rows[0];
}

async function insertFeatures(id, features) {
  let lastUpdated;

  if (features?.length > 0) {
    for (const feature of features) {
      const query = {
        text: `
        UPDATE users
        SET 
          features = CASE 
            WHEN array_position(features, $2) IS NULL THEN array_append(features, $2)
            ELSE features
          END,
          updated_at = (now() at time zone 'utc')
        WHERE id = $1
        RETURNING *;
        `,
        values: [id, feature],
      };

      const res = await db.query(query);
      lastUpdated = res.rows[0];
    }
  }

  return lastUpdated;
}

async function removeFeatures(id, features) {
  let lastUpdated;

  if (features?.length > 0) {
    for (const feature of features) {
      const query = {
        text: `
        UPDATE users 
        SET features = array_remove(features, $1), updated_at = (now() at time zone 'utc') 
        WHERE id = $2 
        RETURNING *;`,
        values: [feature, id],
      };

      const res = await db.query(query);
      lastUpdated = res.rows[0];
    }
  } else {
    const query = {
      text: `
      UPDATE users 
      SET features = '{}', updated_at = (now() at time zone 'utc') 
      WHERE id = $1 
      RETURNING *;`,
      values: [id],
    };

    const res = await db.query(query);
    lastUpdated = res.rows[0];
  }

  return lastUpdated;
}

export default {
  create,
  update,
  createAdmin,
  findById,
  findByEmail,
  findByFullName,
  findByFeature,
  findByMissingFeature,
  findAll,
  removeByEmail,
  createAnonymous,
  insertFeatures,
  removeFeatures,
};
