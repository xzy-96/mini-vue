import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlage";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container, parentComponent) {
  patch(vnode, container, parentComponent);
}

function patch(vnode, container, parentComponent) {
  // 去处理 组件
  // patch 判断vnde 是不是一个 element
  // 是element 就去处理element

  const { shapeFlag, type } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
  }
}

function processText(vnode, container) {
  debugger;
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
function processFragment(vnode, container, parentComponent) {
  mountChilren(vnode, container, parentComponent);
}
function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}
function mountComponent(initialVnode, container, parentComponent) {
  const instance = createComponentInstance(initialVnode, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container, instance);
  initialVnode.el = subTree.el;
}
function processElement(vnode: any, container: any, parentComponent) {
  // init -updata
  mountElement(vnode, container, parentComponent);
}

function mountElement(vnode, container, parentComponent) {
  // const vnode = {
  //   type,
  //   props,
  //   children,
  // };

  const el = (vnode.el = document.createElement(vnode.type));
  // string array
  const { children, props, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
    mountChilren(vnode, el, parentComponent);
  }

  for (const key in props) {
    const val = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    }
    el.setAttribute(key, val);
  }
  container.append(el);
  // document.body.append(el);
}

function mountChilren(vnode, container, parentComponent) {
  vnode.children.forEach((item) => {
    patch(item, container, parentComponent);
  });
}
