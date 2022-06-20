import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlage";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 去处理 组件
  // patch 判断vnde 是不是一个 element
  // 是element 就去处理element
  // console.log(vnode.type,ShapeFlags.ELEMENT);
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMMPONENT) {
    processComponent(vnode, container);
  }
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}
function mountComponent(initialVnode, container) {
  const instance = createComponentInstance(initialVnode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  initialVnode.el = subTree.el;
}
function processElement(vnode: any, container: any) {
  // init -updata
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
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
    mountChilren(vnode, el);
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

function mountChilren(vnode, container) {
  vnode.children.forEach((item) => {
    // if (Array.isArray(item)) {
    //   item.forEach((v) => {
    //     patch(v, container);
    //   });
    // } else {
    patch(item, container);
    // }
  });
}
