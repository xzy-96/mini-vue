import { h, ref } from "../../lib/guide-mini-vue.esm.js";

const prevChildren = [
  h("div", { key: "a" }, "a"),
  h("div", { key: "b" }, "b"),
  h("div", { key: "c" }, "c"),
];
const nextChildren = [h("div", { key: "a" }, "a"), h("div", { key: "b" }, "b")];
export default {
  name: "Arraytotext",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    const _this = this;
    return _this.isChange == true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
