import orchestrator from "tests/orchestrator.js";
import RequestBuilder from "tests/requestBuilder";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.runPendingMigrations();
});

describe("INJECT to /api/v1/availabledays", () => {
  describe("Manager user", () => {
    test("With valid values", async () => {
      const reqB = new RequestBuilder(`/api/v1/availabledays`);
      await reqB.buildAdmin();

      const allDates = Array.from(new Set([...holidays, ...weekendDates]));
      const allDatesAsObjects = allDates.map((date) => new Date(date));

      await Promise.all(
        allDatesAsObjects.map(
          (date, index) =>
            new Promise((resolve) =>
              setTimeout(async () => {
                await reqB.post({ date });
                resolve();
              }, index * 200),
            ),
        ),
      );

      const { res } = await reqB.get();
      expect(res.status).toBe(200);
    });
  });
});

const holidays = [
  "2024-01-01",
  "2024-02-12",
  "2024-02-13",
  "2024-02-14",
  "2024-03-29",
  "2024-04-21",
  "2024-05-01",
  "2024-05-30",
  "2024-08-30",
  "2024-09-07",
  "2024-10-12",
  "2024-10-15",
  "2024-10-28",
  "2024-11-02",
  "2024-11-15",
  "2024-11-20",
  "2024-12-08",
  "2024-12-24",
  "2024-12-25",
  "2024-12-26",
  "2024-12-27",
  "2024-12-28",
  "2024-12-29",
  "2024-12-30",
  "2024-12-31",
  "2025-01-01",
  "2025-03-03",
  "2025-03-04",
  "2025-03-05",
  "2025-04-18",
  "2025-04-21",
  "2025-05-01",
  "2025-06-19",
  "2025-09-07",
  "2025-10-12",
  "2025-10-15",
  "2025-10-28",
  "2025-11-02",
  "2025-11-15",
  "2025-11-20",
  "2025-12-24",
  "2025-12-25",
  "2025-12-26",
  "2025-12-27",
  "2025-12-28",
  "2025-12-29",
  "2025-12-30",
  "2025-12-31",
  "2026-01-01",
  "2026-02-16",
  "2026-02-17",
  "2026-02-18",
  "2026-04-03",
  "2026-04-21",
  "2026-05-01",
  "2026-06-04",
  "2026-09-07",
  "2026-10-12",
  "2026-10-15",
  "2026-10-28",
  "2026-11-02",
  "2026-11-15",
  "2026-11-20",
  "2026-12-24",
  "2026-12-25",
  "2026-12-26",
  "2026-12-27",
  "2026-12-28",
  "2026-12-29",
  "2026-12-30",
  "2026-12-31",
];

function addWeekends(startYear, endYear) {
  const weekends = [];
  const startDate = new Date(`${startYear}-01-01`);
  const endDate = new Date(`${endYear}-12-31`);

  for (
    let date = startDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekends.push(date.toISOString().split("T")[0]);
    }
  }

  return weekends;
}

const weekendDates = addWeekends(2024, 2026);
