import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to /api/v1/maintenances/[id]", () => {
  describe("Anonymous user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Retrieving the endpoint", async () => {
      const testMaintenance = await orchestrator.createMaintenance();
      const res = await fetch(
        `${orchestrator.webserverUrl}/api/v1/maintenances/${testMaintenance.id}`,
        { method: "PATCH" },
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

      const { res, resBody } = await reqB.patch();

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

    test("With valid info", async () => {
      const testMaintenance = await orchestrator.createMaintenance();
      const reqB = new RequestBuilder(
        `/api/v1/maintenances/${testMaintenance.id}`,
      );
      await reqB.buildAdmin();

      const { res, resBody } = await reqB.patch({
        machine: "Máquinaaaa",
        role: "predictive",
        criticality: "critical",
        problem: "Deu ruimm",
        expires_at: new Date(Date.now() + 1000 * 30),
      });

      expect(res.status).toBe(200);
      expect(resBody.machine).toEqual("Máquinaaaa");
      expect(resBody.role).toBe("predictive");
      expect(resBody.criticality).toBe("critical");
      expect(resBody.problem).toBe("Deu ruimm");
      expect(Date.parse(resBody.expires_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.created_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.updated_at)).not.toEqual(NaN);
    });
  });
});
