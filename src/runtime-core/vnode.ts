import { ShapeFlags } from "../shared/ShapeFlage";

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
  };
  if(typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILREN 
  }else if(Array.isArray(children)){
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILREN
  }
  return vnode;
}
function getShapeFlag(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMMPONENT
}