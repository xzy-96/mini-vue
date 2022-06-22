import { h, provide } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./foo.js";

export const App = {
  name: "app",
  render() {
    const app = h("div", {}, "app");
    const foo = h(Foo);
    return h("div", {}, [app, foo]);
  },
  setup() {
    provide("povide", { name: "我是povide" });
  },
};
