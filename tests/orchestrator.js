import retry from "async-retry";
import setCookieParser from "set-cookie-parser";

import db from "infra/database";
import migrator from "infra/migrator.js";
import user from "models/user";
import session from "models/session";
import webserver from "infra/webserver";
import maintenance from "models/maintenance";

if (process.env.NODE_ENV !== "test") {
  throw new Error({
    message: "Orchestrator should only be used in tests",
  });
}

const webserverUrl = webserver.host;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForDatabase();

  async function waitForWebServer() {
    return await retry(
      async (bail, tries) => {
        if (tries >= 25) {
          console.log(
            `> Trying to connect to Webserver #${tries}. Are you running the server with "npm run dev"?`,
          );
        }
        await fetch(`${webserverUrl}/api/v1/status`);
      },
      {
        retries: 50,
        minTimeout: 10,
        maxTimeout: 1000,
        factor: 1.1,
      },
    );
  }

  async function waitForDatabase() {
    return await retry(
      async (bail, tries) => {
        if (tries >= 25) {
          console.log(
            `> Trying to connect to Database #${tries}. Are you running the Postgres container?`,
          );
        }
        const connection = await db.getNewClient();
        await connection.end();
      },
      {
        retries: 50,
        minTimeout: 10,
        maxTimeout: 1000,
        factor: 1.1,
      },
    );
  }
}

async function dropAllTables() {
  const dbClient = await db.getNewClient();
  await dbClient.query("drop schema public cascade; create schema public;");

  await dbClient.end();
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

const generateRandomCharacters = (count) => {
  const characters = [];

  for (let i = 0; i < count; i++) {
    const isUpperCase = Math.random() < 0.5;
    const asciiOffset = isUpperCase ? 65 : 97;
    const randomLetter = String.fromCharCode(
      Math.floor(Math.random() * 26) + asciiOffset,
    );
    characters.push(randomLetter);
  }

  return characters.join("");
};

async function createUser(userObj) {
  const randomCharacters = generateRandomCharacters(10);
  let email = `${randomCharacters}@email.com`;

  const info = {
    full_name: userObj?.full_name || "Valid User Full Name",
    email: userObj?.email || email,
    password: userObj?.password || "validuserpassword",
  };

  return await user.create(info);
}

async function createSession(userObj) {
  return await session.create(userObj.id);
}

async function findSessionByToken(token) {
  return await session.findByToken(token);
}

async function insertFeaturesToUser(userId, features) {
  return await user.insertFeatures(userId, features);
}

async function removeFeaturesFromUser(userId, features) {
  return await user.removeFeatures(userId, features);
}

function parseSetCookies(res) {
  const setCookieHeaderValues = res.headers.get("set-cookie");
  const parsedCookies = setCookieParser.parse(setCookieHeaderValues, {
    map: true,
  });
  return parsedCookies;
}

async function createMaintenance(maintenanceObj = {}) {
  const info = {
    machine: maintenanceObj.machine || "Máquina 1",
    role: maintenanceObj.role || "preventive",
    criticality: maintenanceObj.criticality || "moderate",
    responsible: maintenanceObj.responsible,
    problem: maintenanceObj.problem || "Deu ruim",
    expires_at: maintenanceObj.expires_at || new Date(Date.now() + 1000 * 30),
  };

  return await maintenance.create(info);
}

export default {
  webserverUrl,
  waitForAllServices,
  dropAllTables,
  runPendingMigrations,
  createUser,
  createSession,
  parseSetCookies,
  findSessionByToken,
  insertFeaturesToUser,
  removeFeaturesFromUser,
  createMaintenance,
};
