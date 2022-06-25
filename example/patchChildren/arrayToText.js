import { h } from "../../lib/guide-mini-vue.esm.js";
const nextChildren = "newChildren";
const prevChildren = [h("div", {}, "a"), h("div", {}, "b")];

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
