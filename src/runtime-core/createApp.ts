// import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createAppAPI(render) {
  return function createApp(rootCommponent) {
    console.log(rootCommponent, "rootCommponent");
    return {
      mount(rootContainer) {
        const vnode = createVNode(rootCommponent);
        render(vnode, rootContainer);
      },
    };
  };
}
