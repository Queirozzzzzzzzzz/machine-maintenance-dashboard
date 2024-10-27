import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/pending", () => {
  describe("Anonymous user", () => {
    test("Retrieving information", async () => {
      const reqB = new RequestBuilder("/api/v1/users/pending");
      const { res, resBody } = await reqB.get();

      expect(res.status).toBe(403);
      expect(resBody.name).toEqual("ForbiddenError");
      expect(resBody.message).toEqual(
        "Usuário não pode executar esta operação.",
      );
      expect(resBody.action).toEqual(
        'Verifique se este usuário possui a feature "read:users".',
      );
      expect(resBody.status_code).toEqual(403);
      expect(resBody.error_location_code).toEqual(
        "MODEL:AUTHORIZATION:CAN_REQUEST:FEATURE_NOT_FOUND",
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
    });
  });

  describe("Logged user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Without signups", async () => {
      const reqB = new RequestBuilder("/api/v1/users/pending");
      await reqB.buildAdmin();

      const { res, resBody } = await reqB.get();

      expect(res.status).toBe(200);
      expect(resBody).toEqual([]);
    });

    test("With signups", async () => {
      const reqB = new RequestBuilder("/api/v1/users/pending");
      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          orchestrator.createUser({
            email: `testvaliduser${i}@email.com`,
            password: "validuserpassword",
          }),
        ),
      );

      await reqB.buildAdmin();

      const { res, resBody } = await reqB.get();

      expect(res.status).toBe(200);
      expect(resBody.length).toBe(5);
    });
  });
});
