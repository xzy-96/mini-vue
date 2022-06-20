import { h, reactive } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./foo.js";

export const App = {
  name: "app",
  render() {
    const app = h("div", {}, "app");
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => h("p", {}, "woshi p" + age),
        footer: () => h("p", {}, "我是p2"),
      }
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    const data = reactive({ msg: "mimi-vue" });
    return {
      data,
    };
  },
};
