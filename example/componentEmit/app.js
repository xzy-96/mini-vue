import { h, reactive } from "../../lib/guide-mini-vue.esm.js";
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
      },
      [
        h("p", { class: "red" }, this.data.msg),
        h(Foo, {
          onAddTodo: (a, b) => {
            console.log("app-emit", a, b);
            this.data.msg = a + b;
          },
          count: 11,
        }),
      ]
    );
  },
  setup() {
    const data = reactive({ msg: "mimi-vue" });
    return {
      data,
    };
  },
};
