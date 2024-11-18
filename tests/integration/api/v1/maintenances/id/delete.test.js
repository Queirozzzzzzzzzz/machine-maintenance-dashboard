import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("DELETE to /api/v1/maintenances", () => {
  describe("Anonymous user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Retrieving the endpoint", async () => {
      const testMaintenance = await orchestrator.createMaintenance();
      const res = await fetch(
        `${orchestrator.webserverUrl}/api/v1/maintenances/${testMaintenance.id}`,
        { method: "DELETE" },
      );

      const resBody = await res.json();

      expect(res.status).toEqual(403);
      expect(resBody.status_code).toEqual(403);
      expect(resBody.name).toEqual("ForbiddenError");
      expect(resBody.message).toEqual(
        "Usuário não pode executar esta operação.",
      );
      expect(resBody.action).toEqual(
        `Verifique se este usuário possui a feature "update:maintenances".`,
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:AUTHORIZATION:CAN_REQUEST:FEATURE_NOT_FOUND",
      );

      const parsedCookies = orchestrator.parseSetCookies(res);
      expect(parsedCookies).toStrictEqual({});
    });
  });

  describe("Technical user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Retrieving information", async () => {
      const testMaintenance = await orchestrator.createMaintenance();
      const reqB = new RequestBuilder(
        `/api/v1/maintenances/${testMaintenance.id}`,
      );
      await reqB.buildUser();

      const { res, resBody } = await reqB.delete();

      expect(res.status).toEqual(403);
      expect(resBody.status_code).toEqual(403);
      expect(resBody.name).toEqual("ForbiddenError");
      expect(resBody.message).toEqual(
        "Usuário não pode executar esta operação.",
      );
      expect(resBody.action).toEqual(
        `Verifique se este usuário possui a feature "update:maintenances".`,
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:AUTHORIZATION:CAN_REQUEST:FEATURE_NOT_FOUND",
      );

      const parsedCookies = orchestrator.parseSetCookies(res);
      expect(parsedCookies).toStrictEqual({});
    });
  });

  describe("Manager user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Retrieving information", async () => {
      const testMaintenance = await orchestrator.createMaintenance();
      const reqB = new RequestBuilder(
        `/api/v1/maintenances/${testMaintenance.id}`,
      );
      await reqB.buildAdmin();

      const { res, resBody } = await reqB.delete();

      expect(res.status).toBe(200);
      expect(resBody.machine).toEqual("Máquina 1");
      expect(resBody.role).toBe("preventive");
      expect(resBody.criticality).toBe("moderate");
      expect(resBody.problem).toBe("Deu ruim");
      expect(Date.parse(resBody.expires_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.created_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.updated_at)).not.toEqual(NaN);
    });
  });
});
