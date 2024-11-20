import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/user/[id]", () => {
  describe("Anonymous user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("Retrieving the endpoint", async () => {
      const res = await fetch(
        `${orchestrator.webserverUrl}/api/v1/user/d308aa64-4cf9-4c62-8b20-419157f8a2d5`,
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
        `Verifique se este usuário possui a feature "update:user:others".`,
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
      const defaultUser = await orchestrator.createUser({
        email: "email@email.com",
      });
      const reqB = new RequestBuilder(`/api/v1/user/${defaultUser.id}`);
      await reqB.buildUser();

      const { res, resBody } = await reqB.patch();

      expect(res.status).toEqual(403);
      expect(resBody.status_code).toEqual(403);
      expect(resBody.name).toEqual("ForbiddenError");
      expect(resBody.message).toEqual(
        "Usuário não pode executar esta operação.",
      );
      expect(resBody.action).toEqual(
        `Verifique se este usuário possui a feature "update:user:others".`,
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

    test("Without body", async () => {
      const defaultUser = await orchestrator.createUser({
        email: "email@email.com",
      });
      const reqB = new RequestBuilder(`/api/v1/user/${defaultUser.id}`);
      await reqB.buildAdmin();

      const { res, resBody } = await reqB.patch();

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual(
        "Objeto enviado deve ter no mínimo uma chave.",
      );
      expect(resBody.action).toEqual(
        `Ajuste os dados enviados e tente novamente.`,
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA",
      );
    });

    test("New email", async () => {
      const defaultUser = await orchestrator.createUser({
        email: "email@email.com",
      });
      const reqB = new RequestBuilder(`/api/v1/user/${defaultUser.id}`);
      await reqB.buildAdmin();

      const newEmail = "newemail@email.com";

      const { res, resBody } = await reqB.patch({ email: newEmail });

      expect(res.status).toBe(200);
      expect(resBody.id).toEqual(defaultUser.id);
      expect(resBody.full_name).toEqual(defaultUser.full_name);
      expect(resBody.email).toEqual(newEmail);
      expect(resBody.features).toEqual(defaultUser.features);
      expect(new Date(resBody.created_at)).toEqual(
        new Date(defaultUser.created_at),
      );
    });
  });
});
