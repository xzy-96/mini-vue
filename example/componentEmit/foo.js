import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "按钮"
    );
    const foo = h("p", {}, "foo" + this.count);
    return h("div", {}, [foo, btn]);
  },
  setup(props, { emit }) {
    const emitAdd = () => {
      emit("add-todo", 1, 2);
      console.log(1111);
    };
    return {
      emitAdd,
    };
  },
};
