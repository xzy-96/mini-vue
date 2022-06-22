import { h, inject, provide } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  render() {
    return h("div", {}, [h("div", {}, this.name), h(FooSon)]);
  },
  setup(props, { emit }) {
    provide("povide", { name: "fooo" });
    const { name } = inject("povide");

    return {
      name,
    };
  },
};

const FooSon = {
  name: "FooSon",
  render() {
    return h("div", {}, this.name + this.defaultName);
  },
  setup(props, { emit }) {
    const { name } = inject("povide");
    const defaultName = inject("default", "我是默认值");
    console.log(name, "fooson");
    return {
      name,
      defaultName,
    };
  },
};
