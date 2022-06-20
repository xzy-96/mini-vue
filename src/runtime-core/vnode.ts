import { ShapeFlags } from "../shared/ShapeFlage";
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
  };
  // h('div',{},children) // children可以是 string 和 array

  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILREN;
  }
  // slot类型必须是组件 + children
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILREN;
    }
  }
  return vnode;
}
function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMMPONENT;
}

export function createVnodeText(text: string) {
  return createVNode(Text, {}, text);
}
