'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === "object";
const hasOwn = (target, key) => Reflect.has(target, key);
// add -> Add
const capitalize = (str) => {
    return str[0].toUpperCase() + str.slice(1);
};
// add-todo -> addTodo
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

let targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return;
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

const emit = (instance, event, ...ary) => {
    // 找到 instance上的props
    const { props } = instance;
    const handleName = toHandlerKey(camelize(event));
    const handler = props[handleName];
    handler && handler(...ary);
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
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
        if (publicGeeter) {
            return publicGeeter(insetance);
        }
    },
    // set({ _: insetance }, key, value) {
    //   debugger;
    //   const { setupState, props } = insetance;
    //   if (key in setupState) {
    //     return value;
    //   }
    // },
};

function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children];
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILREN */) {
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

function createComponentInstance(vnode, parent) {
    console.log(parent, "parent");
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { },
        slots: {},
    };
    // 需要获取到 props
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(insetance) {
    initProps(insetance, insetance.vnode.props);
    initSlots(insetance, insetance.vnode.children);
    setupStatefulCopmonent(insetance);
}
function setupStatefulCopmonent(insetance) {
    const Compontent = insetance.type;
    insetance.proxy = new Proxy({ _: insetance }, PublicInstanceProxyHandles);
    const { setup } = Compontent;
    if (setup) {
        setCurrentinstance(insetance);
        const setupResult = setup(shallowReadonly(insetance.props), {
            emit: insetance.emit,
        });
        handleSetupResult(insetance, setupResult);
        setCurrentinstance(null);
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
let currentinstance = null;
function getCurrentInstance() {
    return currentinstance;
}
function setCurrentinstance(instance) {
    currentinstance = instance;
}

function inject(key, val) {
    const currentInstance = getCurrentInstance();
    const prarentProvides = currentInstance.parent.provides;
    if (key in prarentProvides) {
        return prarentProvides[key];
    }
    else {
        return val;
    }
}
function provide(key, value) {
    // 存
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent && currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // h('div',{},children) // children可以是 string 和 array
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILREN */;
    }
    // slot类型必须是组件 + children
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMMPONENT */;
}
function createVnodeText(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

// import { render } from "./renderer";
function createAppAPI(render) {
    return function createApp(rootCommponent) {
        console.log(rootCommponent, "rootCommponent");
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootCommponent);
                render(vnode, rootContainer);
            },
        };
    };
}

function createRenderer(options) {
    const { patchProp, insert, createElement } = options;
    function render(vnode, container) {
        patch(vnode, container, null);
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
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMMPONENT */) {
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
    function processElement(vnode, container, parentComponent) {
        // init -updata
        mountElement(vnode, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
        // const vnode = {
        //   type,
        //   props,
        //   children,
        // };
        const el = (vnode.el = createElement(vnode.type));
        // string array
        const { children, props, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILREN */) {
            mountChilren(vnode, el, parentComponent);
        }
        for (const key in props) {
            const val = props[key];
            // const isOn = (key: string) => /^on[A-Z]/.test(key);
            // if (isOn(key)) {
            //   const event = key.slice(2).toLowerCase();
            //   el.addEventListener(event, val);
            // }
            // el.setAttribute(key, val);
            patchProp(el, key, val);
        }
        // container.append(el);
        // document.body.append(el);
        insert(el, container);
    }
    function mountChilren(vnode, container, parentComponent) {
        vnode.children.forEach((item) => {
            patch(item, container, parentComponent);
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    el.setAttribute(key, val);
}
function insert(el, parent) {
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createVnodeText = createVnodeText;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.reactive = reactive;
exports.renderSlots = renderSlots;
//# sourceMappingURL=guide-mini-vue.cjs.js.map
