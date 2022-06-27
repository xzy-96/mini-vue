import { h, ref } from "../../lib/guide-mini-vue.esm.js";
// (ab)c => ab
// const prevChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ];
// const nextChildren = [h("div", { key: "a" }, "a"), h("div", { key: "b" }, "b")];
// a(bc) => bc
// const prevChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ];
// const nextChildren = [h("div", { key: "b" }, "b"), h("div", { key: "c" }, "c")];

// (abc) => (abc)d
// const prevChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ];
// const nextChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
//   h("div", { key: "d" }, "d"),
// ];

// (abc) => d(abc);
// const prevChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ];
// const nextChildren = [
//   h("div", { key: "d" }, "d"),
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
// ];

// // ab(cd)fg => ab(ec)fg
// 如何确定d 在不在 ec 里面
// 用map 存ec
// const prevChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
//   h("div", { key: "d" }, "d"),
//   h("div", { key: "f" }, "f"),
//   h("div", { key: "g" }, "g"),
// ];
// const nextChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "e" }, "e"),
//   h("div", { key: "c", id: "isid" }, "c"),
//   h("div", { key: "f" }, "f"),
//   h("div", { key: "g" }, "g"),
// ];
// // ab(cd)fg => ab(ec)fg
// 如何确定d 在不在 ec 里面
// 用map 存ec
// const prevChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "c" }, "c"),
//   h("div", { key: "e" }, "e"),
//   h("div", { key: "d" }, "d"),
//   h("div", { key: "f" }, "f"),
//   h("div", { key: "g" }, "g"),
// ];
// const nextChildren = [
//   h("div", { key: "a" }, "a"),
//   h("div", { key: "b" }, "b"),
//   h("div", { key: "e" }, "e"),
//   h("div", { key: "c", id: "isid" }, "c"),
//   h("div", { key: "f" }, "f"),
//   h("div", { key: "g" }, "g"),
// ];

const prevChildren = [
  h("div", { key: "a" }, "a"),
  h("div", { key: "b" }, "b"),
  h("div", { key: "c" }, "c"),
  h("div", { key: "d" }, "d"),
  h("div", { key: "e" }, "e"),
  h("div", { key: "Z" }, "z"),
  h("div", { key: "f" }, "f"),
  h("div", { key: "g" }, "g"),
];
const nextChildren = [
  h("div", { key: "a" }, "a"),
  h("div", { key: "b" }, "b"),
  h("div", { key: "d" }, "d"),
  h("div", { key: "c", id: "isid" }, "c"),
  h("div", { key: "y" }, "y"),
  h("div", { key: "e" }, "e"),
  h("div", { key: "f" }, "f"),
  h("div", { key: "g" }, "g"),
];
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
