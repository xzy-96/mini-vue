import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlage";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    hostPatchProps,
    insert: hostInset,
    createElement: hostCreateElement,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    // 去处理 组件
    // patch 判断vnde 是不是一个 element
    // 是element 就去处理element

    const { shapeFlag, type } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }
  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChilren(n2.children, container, parentComponent, anchor);
  }
  function processComponent(n1, n2, container, parentComponent, anchor) {
    mountComponent(n1, n2, container, parentComponent, anchor);
  }
  function mountComponent(
    n1,
    initialVnode,
    container,
    parentComponent,
    anchor
  ) {
    const instance = createComponentInstance(initialVnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container, anchor);
  }

  function setupRenderEffect(instance, initialVnode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy)); // 存起来初始化的 虚拟DOM 更新的时候作对比
        console.log(subTree, "subTree");
        patch(null, subTree, container, instance, anchor);
        initialVnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree; // 更新之后 他就是 上一个虚拟节点了
        patch(preSubTree, subTree, container, instance, anchor);
        console.log(subTree, "subTree");
        console.log("updata");
      }
    });
  }
  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    // init -updata
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }
  const EMPTY_OBJ = {};
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlags = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;
    // arr -> text
    if (shapeFlag & ShapeFlags.TEXT_CHILREN) {
      // 判断新的节点是否是text
      if (prevShapeFlags & ShapeFlags.ARRAY_CHILREN) {
        // 1.把老的清空
        unmountChildren(n1.children);
      }
      // 2. 设置text
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlags & ShapeFlags.TEXT_CHILREN) {
        // 判断老的节点是否是text 新的必定是 arr
        // 清空
        hostSetElementText(container, "");
        mountChilren(c2, container, parentComponent, anchor);
      } else {
        // arr -> arr diff
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
    let i = 0,
      l2 = c2.length,
      e1 = c1.length - 1,
      e2 = l2 - 1;
    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }
    // old a b c ------new a b d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }
      i++;
    }
    // 右侧 old a b c ------new d e b c
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // 3.当新的比老的多是 创建
    if (i >= e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      } else if (i > e2) {
        // 当新的比老的少时 删除 abc => ab
        while (i <= e1) {
          hostRemove(c1[i].el);
          i++;
        }
      }
    }
    // unmountChildren(c1.slice(i));
    // mountChilren(c2.slice(i), container, parentComponent);
    console.log(i);
  }

  function unmountChildren(children) {
    console.log(children, "unmountChildren");
    for (var i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }
  function patchProps(el, oldProps, newProps) {
    console.log(oldProps, newProps, "oldProps, newProps");
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProps(el, key, prevProp, nextProp);
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProps(el, key, oldProps[key], null);
          }
        }
      }
    }
  }
  function mountElement(vnode, container, parentComponent, anchor) {
    // const vnode = {
    //   type,
    //   props,
    //   children,
    // };

    const el = (vnode.el = hostCreateElement(vnode.type));
    // string array
    const { children, props, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
      mountChilren(vnode.children, el, parentComponent, anchor);
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
    hostInset(el, container, anchor);
  }

  function mountChilren(children, container, parentComponent, anchor) {
    children.forEach((item) => {
      patch(null, item, container, parentComponent, anchor);
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}
