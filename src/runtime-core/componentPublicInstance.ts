import { hasOwn } from "../shared";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
};
export const PublicInstanceProxyHandles = {
  get({ _: insetance }, key) {
    // debugger;
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

    if (publicGeeter) {
      return publicGeeter(insetance);
    }
  },
  // set({ _: insetance }, key, value) {
  //   debugger;
  //   const { setupState, props } = insetance;
  //   if (key in setupState) {
  //     return value;
  //   }
  // },
};
