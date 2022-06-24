import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  render() {
    return h("div", { id: "root" }, [
      h("div", {}, "woshi" + this.count),
      h(
        "button",
        {
          onClick: this.onClick,
        },
        "点击"
      ),
    ]);
  },
  setup() {
    const count = ref(1);
    const onClick = () => count.value++;
    return {
      count,
      onClick,
    };
  },
};
