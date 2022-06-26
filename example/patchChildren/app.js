import { h } from "../../lib/guide-mini-vue.esm.js";
import arrayToText from "./arrayToText.js";
import arrayToArray from "./arrayToArray.js";
import textTotext from "./textToText.js";
import textToArray from "./textToArray.js";
export const App = {
  name: "App",
  render() {
    return h("div", { class: "name" }, [
      h("p", { class: "mr-2" }, "主页"),

      // 老的是Array 新的是text
      // h(arrayToText),
      // 老的是text 新的是text
      // h(textTotext),
      // 老的是Array 新的是Array
      h(arrayToArray),
      // 老的是text 新的是Array
      // h(textToArray),
    ]);
  },
  setup() {
    return {};
  },
};
