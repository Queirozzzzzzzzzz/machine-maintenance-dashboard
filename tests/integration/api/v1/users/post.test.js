import { version as uuidVersion } from "uuid";

import password from "models/password.js";
import user from "models/user.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const values = {
        full_name: "Unique User Full Name",
        email: "uniqueuseremail@email.com",
        password: "uniqueuserpassword",
      };

      const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          password: values.password,
          confirm_password: values.password,
        }),
      });

      const resBody = await res.json();

      expect(res.status).toBe(201);
      expect(uuidVersion(resBody.id)).toEqual(4);
      expect(resBody.full_name).toEqual(values.full_name);
      expect(resBody.features).toEqual(["read:session", "read:user"]);
      expect(Date.parse(resBody.created_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.updated_at)).not.toEqual(NaN);

      const userInDatabase = await user.findByFullName(values.full_name);
      const validPasswordsMatch = await password.compare(
        values.password,
        userInDatabase.password,
      );
      const wrongPasswordMatch = await password.compare(
        "wronguserpassword",
        userInDatabase.password,
      );

      expect(userInDatabase.email).toBe(values.email);
      expect(validPasswordsMatch).toBe(true);
      expect(wrongPasswordMatch).toBe(false);
    });

    test("With unique and valid data, and an unknown key", async () => {
      const values = {
        full_name: "Unknownkey fullname",
        email: "unknownkeyemail@email.com",
        password: "unknownkeypassword",
        unknownKey: "Unknown Key",
      };

      const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          password: values.password,
          confirm_password: values.password,
          unknownKey: values.unknownKey,
        }),
      });

      const resBody = await res.json();

      expect(res.status).toBe(201);
      expect(uuidVersion(resBody.id)).toEqual(4);
      expect(resBody.full_name).toEqual(values.full_name);
      expect(resBody.features).toEqual(["read:session", "read:user"]);
      expect(Date.parse(resBody.created_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.updated_at)).not.toEqual(NaN);

      const userInDatabase = await user.findByFullName(values.full_name);
      const validPasswordsMatch = await password.compare(
        values.password,
        userInDatabase.password,
      );
      const wrongPasswordMatch = await password.compare(
        "wronguserpassword",
        userInDatabase.password,
      );

      expect(userInDatabase.email).toBe(values.email);
      expect(validPasswordsMatch).toBe(true);
      expect(wrongPasswordMatch).toBe(false);
    });

    test(`With unique and valid data, but with "untrimmed" values`, async () => {
      const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: "extraSpaceInTheEnd ",
          email: " space.in.the.beggining@gmail.com",
          password: "extraspaceintheendpassword ",
          confirm_password: "extraspaceintheendpassword ",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toBe(201);
      expect(uuidVersion(resBody.id)).toEqual(4);
      expect(resBody.full_name).toEqual("extraSpaceInTheEnd");
      expect(resBody.features).toEqual(["read:session", "read:user"]);
      expect(Date.parse(resBody.created_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.updated_at)).not.toEqual(NaN);

      const userInDatabase = await user.findByFullName("extraSpaceInTheEnd");
      const validPasswordsMatch = await password.compare(
        "extraspaceintheendpassword",
        userInDatabase.password,
      );
      const wrongPasswordMatch = await password.compare(
        "wronguserpassword",
        userInDatabase.password,
      );

      expect(userInDatabase.email).toBe("space.in.the.beggining@gmail.com");
      expect(validPasswordsMatch).toBe(true);
      expect(wrongPasswordMatch).toBe(false);
    });

    describe("full_name", () => {
      test(`With "full_name" missing`, async () => {
        const values = {
          email: "missingfullnameemail@email.com",
          password: "missingfullnamepassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"full_name" é um campo obrigatório.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("full_name");
      });

      test(`With "full_name" with a null value`, async () => {
        const values = {
          full_name: null,
          email: "nullfullnameemail@email.com",
          password: "nullfullnamepassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"full_name" deve ser do tipo String.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("full_name");
      });

      test(`With "full_name" with an empty string`, async () => {
        const values = {
          full_name: "",
          email: "emptyfullnameemail@email.com",
          password: "missingfullnamepassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual(
          '"full_name" não pode estar em branco.',
        );
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("full_name");
      });

      test(`With "full_name" that\'s not a String`, async () => {
        const values = {
          full_name: 1234,
          email: "nonstringfullnameemail@email.com",
          password: "nonstringfullnamepassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"full_name" deve ser do tipo String.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("full_name");
      });

      test(`With "full_name" containing non alphanumeric characters`, async () => {
        const values = {
          full_name: "alphanumeric!fullname",
          email: "alphanumericfullnameemail@email.com",
          password: "alphanumericfullnamepassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"full_name" está no formato errado.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("full_name");
      });

      test(`With "full_name" too long`, async () => {
        const values = {
          full_name: "a".repeat(101),
          email: "toolongfullnameemail@email.com",
          password: "toolongfullnamepassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual(
          '"full_name" deve conter no máximo 100 caracteres.',
        );
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("full_name");
      });
    });

    describe("Email", () => {
      test(`With "email" duplicated`, async () => {
        const values = {
          full_name: "Duplicated Email Full Name",
          email: "uniqueuseremail@email.com",
          password: "duplicatedemailpassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

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

      test(`With "email" missing`, async () => {
        const values = {
          full_name: "Missing Email Full Name",
          password: "missingemailpassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"email" é um campo obrigatório.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("email");
      });

      test(`With "email" with an empty string`, async () => {
        const values = {
          full_name: "Empty Email Full Name",
          email: "",
          password: "emptyemailpassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"email" não pode estar em branco.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("email");
      });

      test(`With "email" that\'s not a String`, async () => {
        const values = {
          full_name: "NonString Email Full Name",
          email: 1234,
          password: "nonstringemailpassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"email" deve ser do tipo String.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("email");
      });

      test(`With "email" in invalid format`, async () => {
        const values = {
          full_name: "Invalid Format Email Full Name",
          email: "invalid-email-format@email@com",
          password: "invalidformatemailpassword",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"email" deve conter um email válido.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("email");
      });
    });

    describe("Password", () => {
      test(`With "password" missing`, async () => {
        const values = {
          full_name: "Missing Password Full Name",
          email: "missingpasswordemail@email.com",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"password" é um campo obrigatório.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("password");
      });

      test(`With "password" with an empty string`, async () => {
        const values = {
          full_name: "Empty Password Full Name",
          email: "emptypasswordemail@email.com",
          password: "",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"password" não pode estar em branco.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("password");
      });

      test(`With "password" that's not a String`, async () => {
        const values = {
          full_name: "Non String Password Full Name",
          email: "nonstringpasswordemail@email.com",
          password: 12345678,
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual('"password" deve ser do tipo String.');
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("password");
      });

      test(`With "password" too short`, async () => {
        const values = {
          full_name: "Short Password Full Name",
          email: "shortpasswordemail@email.com",
          password: "short",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual(
          '"password" deve conter no mínimo 8 caracteres.',
        );
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("password");
      });

      test(`With "password" too long`, async () => {
        const values = {
          full_name: "Long Password Full Name",
          email: "longpasswordemail@email.com",
          password:
            "password73characterssssssssssssssssssssssssssssssssssssssssssssssssssssss",
        };

        const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            confirm_password: values.password,
          }),
        });

        const resBody = await res.json();

        expect(res.status).toEqual(400);
        expect(resBody.status_code).toEqual(400);
        expect(resBody.name).toEqual("ValidationError");
        expect(resBody.message).toEqual(
          '"password" deve conter no máximo 72 caracteres.',
        );
        expect(resBody.action).toEqual(
          "Ajuste os dados enviados e tente novamente.",
        );
        expect(uuidVersion(resBody.error_id)).toEqual(4);
        expect(uuidVersion(resBody.request_id)).toEqual(4);
        expect(resBody.error_location_code).toEqual(
          "MODEL:VALIDATOR:FINAL_SCHEMA",
        );
        expect(resBody.key).toEqual("password");
      });
    });

    test(`With "body" blank`, async () => {
      const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
        method: "POST",
      });

      const resBody = await res.json();

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual(
        '"body" enviado deve ser do tipo Object.',
      );
      expect(resBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente.",
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA",
      );
      expect(resBody.key).toEqual("object");
    });

    test(`With "body" with a String`, async () => {
      const res = await fetch(`${orchestrator.webserverUrl}/api/v1/users`, {
        method: "POST",
        body: ":)",
      });

      const resBody = await res.json();

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual(
        '"body" enviado deve ser do tipo Object.',
      );
      expect(resBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente.",
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA",
      );
      expect(resBody.key).toEqual("object");
    });
  });
});
