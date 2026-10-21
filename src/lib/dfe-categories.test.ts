import { test, expect } from "vitest";
import { groupByDfeCategory } from "./dfe-categories";

test("topics sit under their DfE category, unmatched ones under Other topics", () => {
  const r = groupByDfeCategory("Business", [{ title: "Marketing", items: [] }, { title: "Zzz", items: [] }]);
  expect(r.map((g) => g.category)).toEqual(["Marketing", "Other topics"]);
});
