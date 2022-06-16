const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === "object";
const hasOwn = (target, key) => Reflect.has(target, key);

let targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShallow = false) {
    return function get(obj, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(obj, key);
        // 看看res 是不是 object
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(obj, key, value) {
        const res = Reflect.set(obj, key, value);
        // 触发依赖
        trigger(obj, key);
        // 表示成功
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyhandlers = {
    get: readonlyGet,
    set(obj, key, value) {
        return true;
    }
};
const shallowhandlers = extend({}, readonlyhandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyhandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowhandlers);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target}必须是对象`);
        return;
    }
    return new Proxy(target, baseHandlers);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandles = {
    get({ _: insetance }, key) {
        const { setupState, props } = insetance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(props, key)) {
            return props[key];
        }
        // if (key === "$el") {
        //   debugger;
        //   return insetance.vnode.el;
        // }
        const publicGeeter = publicPropertiesMap[key];
        if (publicGeeter)
            publicGeeter(insetance);
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
    };
    return component;
}
function setupComponent(insetance) {
    initProps(insetance, insetance.vnode.props);
    // initSlots()
    setupStatefulCopmonent(insetance);
}
function setupStatefulCopmonent(insetance) {
    const Compontent = insetance.type;
    insetance.proxy = new Proxy({ _: insetance }, PublicInstanceProxyHandles);
    const { setup } = Compontent;
    if (setup) {
        const setupResult = setup(shallowReadonly(insetance.props));
        handleSetupResult(insetance, setupResult);
    }
}
function handleSetupResult(insetance, setupResult) {
    if (typeof setupResult === "object") {
        insetance.setupState = setupResult;
    }
    finishComponentSetup(insetance);
}
function finishComponentSetup(insetance) {
    const Compontent = insetance.type;
    if (Compontent.render) {
        insetance.render = Compontent.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 去处理 组件
    // patch 判断vnde 是不是一个 element
    // 是element 就去处理element
    // console.log(vnode.type,ShapeFlags.ELEMENT);
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMMPONENT */) {
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
function processElement(vnode, container) {
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
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILREN */) {
        mountChilren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
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
        patch(item, container);
    });
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMMPONENT */;
}

function createApp(rootCommponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootCommponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
//# sourceMappingURL=guide-mini-vue.esm.js.map
