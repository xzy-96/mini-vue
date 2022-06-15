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
        onClick() {
          console.log("click");
        },
      },
      this.msg + "1123"
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
