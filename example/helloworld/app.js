import { h } from "../../lib/guide-mini-vue.esm.js";
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      this.msg
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
