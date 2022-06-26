import { h, ref } from "../../lib/guide-mini-vue.esm.js";
const nextChildren = "newChildren";

const prevChildren = "oldChildren";
export default {
  name: "textToText",
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
