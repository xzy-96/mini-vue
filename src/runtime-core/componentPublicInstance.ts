const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};
export const PublicInstanceProxyHandles = {
  get({ _: insetance }, key) {
    const { setupState } = insetance;
    if (key in setupState) {
      return setupState[key];
    }
    // if (key === "$el") {
    //   debugger;
    //   return insetance.vnode.el;
    // }
    const publicGeeter = publicPropertiesMap[key];
    if (publicGeeter) publicGeeter(insetance);
  },
};
