import { baseParse } from "../src/parse";

describe("parse", () => {
  describe("interpolation", () => {
    const ast = baseParse("{{message}}");
    expect(ast.children[0]).toStrictEqual({
      type: "interpolation",
      conttent: {
        type: "simple_expression",
        content: "message",
      },
    });
  });
});
