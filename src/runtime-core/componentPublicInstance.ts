import { hasOwn } from "../shared";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};
export const PublicInstanceProxyHandles = {
  get({ _: insetance }, key) {
    const { setupState, props } = insetance;
    if (key in setupState) {
      return setupState[key];
    }
    if (hasOwn(props, key)) {
      return props[key];
    }
    // if (key === "$el") {
    //   debugger;
    //   return insetance.vnode.el;
    // }
    const publicGeeter = publicPropertiesMap[key];
    if (publicGeeter) publicGeeter(insetance);
  },
  // set({ _: insetance }, key, value) {
  //   debugger;
  //   const { setupState, props } = insetance;
  //   if (key in setupState) {
  //     return value;
  //   }
  // },
};
