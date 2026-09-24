import { describe, expect, it } from "vitest";
import { allocateWeek, nextBoxLabel, pinUrgent, urgencyMultiplier, weaknessWeight } from "./scheduling.testkit";
describe("engine", () => {
  it("urgency ramps inside 28 days", () => {
    expect(urgencyMultiplier(40)).toBe(1);
    expect(urgencyMultiplier(28)).toBe(1);
    expect(urgencyMultiplier(0)).toBe(4);
    expect(urgencyMultiplier(14)).toBeCloseTo(2.5);
  });
  it("weakness bands", () => {
    expect(weaknessWeight(1)).toBe(3);
    expect(weaknessWeight(4)).toBe(2);
    expect(weaknessWeight(5)).toBe(0.5);
  });
  it("caps and floors", () => {
    const subjects = [{ subjectId: "a", confidence: 1 }, { subjectId: "b", confidence: 4 }, { subjectId: "c", confidence: 4 }];
    const out = allocateWeek(subjects, 10, [30, 1, 1], {});
    expect(out.filter((x) => x === "a").length).toBeLessThanOrEqual(5);
    expect(out).toContain("b");
    expect(out).toContain("c");
  });
  it("pins and slides", () => {
    const { ids, pinned } = pinUrgent(["a", "b", "c", "d"], [null, null, "d", "d"]);
    expect(ids).toEqual(["a", "b", "d", "c"]);
    expect(pinned[2]).toBe(true);
  });
  it("leitner", () => {
    expect(nextBoxLabel("3", true)).toBe("bench");
    expect(nextBoxLabel("2", false)).toBe("1");
  });
});
