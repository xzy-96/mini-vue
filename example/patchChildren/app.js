import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  render() {
    return h("div", { class: "name" }, [
      h("p", { class: "mr-2" }, "主页"),
      // 老的是Array 新的是text
      // 老的是Array 新的是Array
      // 老的是text 新的是Array
      // 老的是text 新的是text
    ]);
  },
  setup() {
    return {};
  },
};
