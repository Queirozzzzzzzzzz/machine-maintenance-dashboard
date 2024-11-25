import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("INJECT to /api/v1/availabledays", () => {
  describe("Manager user", () => {
    beforeEach(async () => {
      await orchestrator.dropAllTables();
      await orchestrator.runPendingMigrations();
    });

    test("With valid values", async () => {
      const reqB = new RequestBuilder(`/api/v1/availabledays`);
      await reqB.buildAdmin();

      const randomDates = Array.from({ length: 10 }, () =>
        generateRandomDate(),
      );

      await Promise.all(
        randomDates.map((date) =>
          reqB.post({
            date,
          }),
        ),
      );

      const { res, resBody } = await reqB.get();
      expect(res.status).toBe(200);
      expect(resBody.length).toEqual(10);
    });
  });
});

const generateRandomDate = () => {
  const now = new Date();
  const year =
    Math.floor(Math.random() * (now.getFullYear() - 1900 + 1)) + 1900;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;

  return new Date(year, month - 1, day);
};
