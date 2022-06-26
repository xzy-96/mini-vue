import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function hostPatchProps(el, key, preVal, nextval) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextval);
  }

  if (nextval === null || nextval === undefined) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextval);
  }
}

function insert(child, parent, anchor) {
  // parent.append(child);
  parent.insertBefore(child, anchor || null);
}

function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}
const renderer: any = createRenderer({
  createElement,
  hostPatchProps,
  insert,
  remove,
  setElementText,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core/index";
