import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 去处理 组件
  // patch 判断vnde 是不是一个 element
  // 是element 就去处理element
  console.log(vnode.type);

  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.type.render();
  patch(subTree, container);
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

  const el = document.createElement(vnode.type);
  // string array
  const { children, props } = vnode;
  if (!Array.isArray(children)) {
    el.textContent = children;
  } else {
    mountChilren(vnode, el);
  }

  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  container.append(el);
  // document.body.append(el);
}

function mountChilren(vnode, container) {
  vnode.children.forEach((item) => {
    patch(item, container);
  });
}
