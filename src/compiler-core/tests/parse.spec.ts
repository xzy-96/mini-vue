import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";

describe("parse", () => {
  describe("interpolation", () => {
    test("simple im", () => {
      const ast = baseParse("{{ message}}");
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });
});

describe("element", () => {
  it("simple element div", () => {
    const ast = baseParse("<div></div>");
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
    });
  });
});
