import { test, expect } from "vitest";
import { groupByDfeCategory } from "./dfe-categories";

test("topics sit under their DfE category, unmatched ones under Other topics", () => {
  const r = groupByDfeCategory("Business", [{ title: "Marketing", items: [] }, { title: "Zzz", items: [] }]);
  expect(r.map((g) => g.category)).toEqual(["Marketing", "Other topics"]);
});

test("a topic added under a heading stays there even when its words don't match", () => {
  const r = groupByDfeCategory("Business", [
    { title: "My own revision notes", items: [], category: "Marketing" },
    { title: "Random words", items: [], category: null },
  ]);
  expect(r.map((g) => g.category)).toEqual(["Marketing", "Other topics"]);
  expect(r[0]!.topics.map((t) => t.title)).toEqual(["My own revision notes"]);
});

test("a stored heading that isn't a DfE category falls back to Other topics", () => {
  const r = groupByDfeCategory("Business", [{ title: "Anything", items: [], category: "Made up heading" }]);
  expect(r.map((g) => g.category)).toEqual(["Other topics"]);
});
