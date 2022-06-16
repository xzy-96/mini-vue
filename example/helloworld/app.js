import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./foo.js";
window.self = null;
export const App = {
  name: "app",
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        onClick() {
          console.log("click");
        },
      },
      [h("p", { class: "red" }, "hi"), h(Foo, { count: 1 })]
      // [
      //   h("p", { class: "red" }, "hi"),
      //   h("p", { calss: "green" }, "mini-vue"),
      //   this.msg,
      // ]
    );
  },
  setup() {
    return {
      msg: "mimi-vue",
    };
  },
};
