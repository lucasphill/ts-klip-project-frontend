import { describe, expect, it } from "vitest";
import { getDueDateStatus, getRelativeDueDateLabel } from "./taskUtils";

const TODAY = "2026-03-01";

describe("getDueDateStatus", () => {
  it("returns none when there is no due date", () => {
    expect(getDueDateStatus(undefined, false, TODAY)).toBe("none");
    expect(getDueDateStatus("", false, TODAY)).toBe("none");
  });

  it("classifies today, tomorrow and later dates", () => {
    expect(getDueDateStatus("2026-03-01", false, TODAY)).toBe("today");
    expect(getDueDateStatus("2026-03-02T12:00:00", false, TODAY)).toBe("tomorrow");
    expect(getDueDateStatus("2026-03-10", false, TODAY)).toBe("upcoming");
  });

  it("marks past dates as overdue only for pending tasks", () => {
    expect(getDueDateStatus("2026-02-28", false, TODAY)).toBe("overdue");
    expect(getDueDateStatus("2026-02-28", true, TODAY)).toBe("upcoming");
  });

  it("handles month and year boundaries", () => {
    expect(getDueDateStatus("2027-01-01", false, "2026-12-31")).toBe("tomorrow");
  });
});

describe("getRelativeDueDateLabel", () => {
  it("labels yesterday, today and tomorrow", () => {
    expect(getRelativeDueDateLabel("2026-02-28", TODAY)).toBe("Ontem");
    expect(getRelativeDueDateLabel("2026-03-01", TODAY)).toBe("Hoje");
    expect(getRelativeDueDateLabel("2026-03-02", TODAY)).toBe("Amanhã");
  });

  it("returns null for other dates", () => {
    expect(getRelativeDueDateLabel("2026-03-05", TODAY)).toBeNull();
    expect(getRelativeDueDateLabel(null, TODAY)).toBeNull();
  });
});
