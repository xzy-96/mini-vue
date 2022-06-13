import { h } from "../../lib/guide-mini-vue.esm.js";
export const App = {
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      [h("p", { class: "red" }, "hi"), h("p", { calss: "green" }, "mini-vue")]
    );
  },
  setup() {
    return {
      msg: "mimi-vue",
    };
  },
};
