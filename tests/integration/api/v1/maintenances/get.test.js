import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/maintenances", () => {
  describe("Anonymous user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Retrieving the endpoint", async () => {
      const res = await fetch(
        `${orchestrator.webserverUrl}/api/v1/maintenances`,
        { method: "GET" },
      );

      const resBody = await res.json();

      expect(res.status).toEqual(200);
      expect(resBody).toEqual([]);
    });
  });

  describe("Technical user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Retrieving information", async () => {
      const reqB = new RequestBuilder(`/api/v1/maintenances`);
      await reqB.buildUser();

      const { res, resBody } = await reqB.get();

      expect(res.status).toEqual(200);
      expect(resBody).toEqual([]);
    });
  });

  describe("Manager user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("With no maintenances", async () => {
      const reqB = new RequestBuilder(`/api/v1/maintenances`);
      await reqB.buildAdmin();

      const { res, resBody } = await reqB.get();

      expect(resBody).toStrictEqual([]);
    });

    test("With maintenances", async () => {
      const reqB = new RequestBuilder(`/api/v1/maintenances`);
      await reqB.buildAdmin();

      await Promise.all(
        Array.from({ length: 5 }, (_, i) => orchestrator.createMaintenance()),
      );

      const { res, resBody } = await reqB.get();

      expect(resBody.length).toBe(5);
    });
  });
});
