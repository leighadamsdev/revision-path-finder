import { test, expect } from "vitest";
import { groupByDfeCategory } from "./dfe-categories";
test("g", () => { const r = groupByDfeCategory("Business", [{title:"Marketing",items:[]},{title:"Zzz",items:[]}]); console.log(JSON.stringify(r.map(x=>x.category))); expect(r[r.length-1].category).toBe("Other topics"); });
