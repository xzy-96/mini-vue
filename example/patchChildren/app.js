import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  render() {
    return h("div", { id: "root", ...this.obj }, [
      h("div", {}, "woshi" + this.count),
      h(
        "button",
        {
          onClick: this.onClick,
        },
        "点击"
      ),
      h(
        "button",
        {
          onClick: this.onChangeBar,
        },
        "改变bar"
      ),
      h(
        "button",
        {
          onClick: this.onsetBarNull,
        },
        "bar设为null"
      ),
      h(
        "button",
        {
          onClick: this.onDeleteBar,
        },
        "删除bar"
      ),
    ]);
  },
  setup() {
    const count = ref(1);
    const obj = ref({
      foo: "fooo",
      bar: "woshi bar",
    });
    const onClick = () => count.value++;
    const onChangeBar = () => {
      obj.value.bar = "我改变了";
      console.log("触发了");
    };
    const onsetBarNull = () => {
      obj.value.bar = null;
    };
    const onDeleteBar = () => {
      obj.value = {
        foo: "fooo",
      };
    };
    return {
      count,
      onClick,
      onChangeBar,
      onDeleteBar,
      onsetBarNull,
      obj,
    };
  },
};
