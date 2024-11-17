import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users/admin", () => {
  describe("Anonymous user", () => {
    test("First post", async () => {
      const reqB = new RequestBuilder("/api/v1/users/admin");
      const { res, resBody } = await reqB.post();

      expect(res.status).toBe(201);
      expect(resBody.full_name).toEqual(process.env.ADMIN_FULL_NAME);
      expect(resBody.email).toEqual(process.env.ADMIN_EMAIL);
      expect(resBody.features).toEqual([
        "admin",
        "create:session",
        "read:session",
        "read:user",
        "read:users",
        "update:user",
        "update:user:others",
        "ban:user",
        "active",
      ]);
      expect(Date.parse(resBody.created_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.updated_at)).not.toEqual(NaN);
      const passwordsMatch = await password.compare(
        process.env.ADMIN_PASSWORD,
        resBody.password,
      );
      expect(passwordsMatch).toBe(true);
    });

    test("Second post", async () => {
      const reqB = new RequestBuilder("/api/v1/users/admin");
      const { res, resBody } = await reqB.post();

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual(
        'O "email" informado já está sendo usado.',
      );
      expect(resBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente.",
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:USER:VALIDATE_UNIQUE_EMAIL:ALREADY_EXISTS",
      );
      expect(resBody.key).toEqual("email");
    });
  });
});
