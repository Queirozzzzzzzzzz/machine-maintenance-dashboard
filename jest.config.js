const nextJest = require("next/jest");
const dotenv = require("dotenv");

dotenv.config({
  path: ".env.development",
});

const createJestConfig = nextJest({
  dir: ".",
});

const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 120000,
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
});

module.exports = jestConfig;
