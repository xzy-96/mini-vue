import {
  h,
  renderSlots,
  getCurrentInstance,
} from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  render() {
    const foo = h("p", {}, "foo");
    // console.log(this.$slots, "this.$slots");
    // h的第三参数必须是 虚假节点vnode 但是 this.$slots是可以 传数组的
    // 具名插槽
    // 获取要渲染 的元素
    // 获取渲染的位置
    // 作用域插槽
    const age = 18;
    return h("div", {}, [
      renderSlots(this.$slots, "header", { age }),
      foo,
      renderSlots(this.$slots, "footer"),
    ]);
  },
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    console.log(instance, "instance");
    const emitAdd = () => {
      emit("add-todo", 1, 2);
    };
    return {
      emitAdd,
    };
  },
};
