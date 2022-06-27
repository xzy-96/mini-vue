import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlage";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    hostPatchProps,
    insert: hostInsert,
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

    let moved = false;
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
    } else {
      // 中间对比
      let s1 = i; // 老节点的开始
      let s2 = i; // 新的节点
      const toBePatched = e2 - s2 + 1; // 要遍历的数量
      let patched = 0; // 已经patch
      const newIndexToOldIndexMap = new Array(toBePatched);
      const keyToNewIndexMap = new Map();
      let maxNewIndexSoFar = 0;
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (let i = s2; i <= e2; i++) {
        let nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }
      let newIndex; // 中间节点的索引
      for (let j = s1; j <= e1; j++) {
        const prveChild = c1[j]; // 当前节点
        if (patched >= toBePatched) {
          hostRemove(prveChild.el);
          continue;
        }
        if (prveChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prveChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prveChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          hostRemove(prveChild.el);
        } else {
          // hostSetElementText()
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          newIndexToOldIndexMap[newIndex - s2] = j + 1;
          patch(prveChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          // 创建新节点
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
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
    hostInsert(el, container, anchor);
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

function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
