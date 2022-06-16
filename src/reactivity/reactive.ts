import { isObject } from "../shared";
import {
  mutableHandlers,
  readonlyhandlers,
  shallowhandlers,
} from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyhandlers);
}
export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowhandlers);
}
function createActiveObject(target: any, baseHandlers) {
  if (!isObject(target)) {
    console.warn(`target ${target}必须是对象`);
    return;
  }
  return new Proxy(target, baseHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
