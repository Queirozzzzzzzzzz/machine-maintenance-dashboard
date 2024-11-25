import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("INJECT maintenances", () => {
  describe("Manager user", () => {
    test("100 maintenances", async () => {
      const reqB = new RequestBuilder(`/api/v1/maintenances`);
      await reqB.buildAdmin();

      const generateRandomData = () => ({
        machine: getRandomString([
          "Máquina 1",
          "Máquina 2",
          "Máquina 3",
          "Máquina 4",
          "Máquina 5",
        ]),
        role: getRandomString([
          "preventive",
          "corrective",
          "predictive",
          "pending",
        ]),
        criticality: getRandomString(["light", "moderate", "high", "critical"]),
        problem: getRandomString([
          "Deu ruim",
          "Não funciona",
          "Erro de sintaxe",
        ]),
        price: getRandomNumber(0, 9999.99).toFixed(2),
        expires_at: getRandomDate().toISOString(),
      });

      const requests = Array.from({ length: 100 }, () => generateRandomData());

      let createdMaintenances = [];

      for (const req of requests) {
        if (req && req.machine) {
          const { res, resBody } = await reqB.post(req);
          expect(res.status).toBe(201);
          createdMaintenances.push(resBody.id);
        } else {
          console.warn("Invalid request data:", req);
        }
      }

      for (const id of createdMaintenances) {
        const progress = getRandomString(["ongoing", "concluded", "aborted"]);
        const updateData = {
          progress,
        };

        if (progress === "concluded") {
          updateData.concluded_at = new Date().toISOString();
        }

        const patchReqB = new RequestBuilder(`/api/v1/maintenances/${id}`);
        await patchReqB.buildAdmin();
        const { res } = await patchReqB.patch(updateData);

        expect(res.status).toBe(200);
      }

      const { res, resBody } = await reqB.get();

      expect(res.status).toBe(200);
    });
  });
});

function getRandomString(strings) {
  return strings[Math.floor(Math.random() * strings.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate() {
  const start = new Date("2023-01-01");
  const end = new Date("2024-12-31");
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}
