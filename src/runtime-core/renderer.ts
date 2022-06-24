import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlage";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const { hostPatchProps, insert, createElement } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  function patch(n1, n2, container, parentComponent) {
    // 去处理 组件
    // patch 判断vnde 是不是一个 element
    // 是element 就去处理element

    const { shapeFlag, type } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }
  function processFragment(n1, n2, container, parentComponent) {
    mountChilren(n2, container, parentComponent);
  }
  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n1, n2, container, parentComponent);
  }
  function mountComponent(n1, initialVnode, container, parentComponent) {
    const instance = createComponentInstance(initialVnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container);
  }

  function setupRenderEffect(instance, initialVnode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy)); // 存起来初始化的 虚拟DOM 更新的时候作对比
        console.log(subTree, "subTree");
        patch(null, subTree, container, instance);
        initialVnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree; // 更新之后 他就是 上一个虚拟节点了
        patch(preSubTree, subTree, container, instance);
        console.log(subTree, "subTree");
        console.log("updata");
      }
    });
  }
  function processElement(n1, n2: any, container: any, parentComponent) {
    // init -updata
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }
  function patchElement(n1, n2, container) {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
  }

  function patchProps(el, oldProps, newProps) {
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (oldProps !== newProps) {
        hostPatchProps(el, key, prevProp, nextProp);
      }
    }
  }
  function mountElement(n2, container, parentComponent) {
    // const vnode = {
    //   type,
    //   props,
    //   children,
    // };

    const el = (n2.el = createElement(n2.type));
    // string array
    const { children, props, shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.TEXT_CHILREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
      mountChilren(n2, el, parentComponent);
    }

    for (const key in props) {
      const val = props[key];
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   const event = key.slice(2).toLowerCase();
      //   el.addEventListener(event, val);
      // }
      // el.setAttribute(key, val);
      hostPatchProps(el, key, null, val);
    }
    // container.append(el);
    // document.body.append(el);
    insert(el, container);
  }

  function mountChilren(n2, container, parentComponent) {
    n2.children.forEach((item) => {
      patch(null, item, container, parentComponent);
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}
