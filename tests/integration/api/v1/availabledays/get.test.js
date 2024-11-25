import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/availabledays", () => {
  describe("Anonymous user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Retrieving the endpoint", async () => {
      const res = await fetch(
        `${orchestrator.webserverUrl}/api/v1/availabledays`,
        { method: "POST" },
      );

      const resBody = await res.json();

      expect(res.status).toEqual(403);
      expect(resBody.status_code).toEqual(403);
      expect(resBody.name).toEqual("ForbiddenError");
      expect(resBody.message).toEqual(
        "Usuário não pode executar esta operação.",
      );
      expect(resBody.action).toEqual(
        `Verifique se este usuário possui a feature "admin".`,
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
      const reqB = new RequestBuilder(`/api/v1/availabledays`);
      await reqB.buildUser();

      const { res, resBody } = await reqB.post();

      expect(res.status).toEqual(403);
      expect(resBody.status_code).toEqual(403);
      expect(resBody.name).toEqual("ForbiddenError");
      expect(resBody.message).toEqual(
        "Usuário não pode executar esta operação.",
      );
      expect(resBody.action).toEqual(
        `Verifique se este usuário possui a feature "admin".`,
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
    test("Retrieving information", async () => {
      const reqB = new RequestBuilder(`/api/v1/availabledays`);
      await reqB.buildAdmin();

      const { res, resBody } = await reqB.get();

      expect(res.status).toBe(200);
      expect(resBody).toEqual([]);
    });
  });
});
