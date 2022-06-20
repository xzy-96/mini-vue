import { ShapeFlags } from "../shared/ShapeFlage";

export function initSlots(instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children];
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILREN) {
    normalizeObjctSlot(children, instance.slots);
  }
}

function normalizeObjctSlot(children, slots) {
  for (var key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}
function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
