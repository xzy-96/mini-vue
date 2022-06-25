const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === "object";
const hasChanged = (val, newVal) => !Object.is(val, newVal);
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

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // reset
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            clearupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function clearupEffect(effect) {
    // 找到所有依赖这个 effect 的响应式对象
    // 从这些响应式对象里面把 effect 给删除掉
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
let targetMap = new Map();
function track(target, key) {
    // 收集fn fn不能重复 所以用 set
    // target >key > dep
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    // 已经在dep 中
    trackEffects(dep);
}
function trackEffects(dep) {
    // 用 dep 来存放所有的 effect
    // TODO
    // 这里是一个优化点
    // 先看看这个依赖是不是已经收集了，
    // 已经收集的话，那么就不需要在收集一次了
    // 可能会影响 code path change 的情况
    // 需要每次都 cleanupEffect
    // shouldTrack = !dep.has(activeEffect!);
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
    }
}
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
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    // Object.assign(_effect,options)
    extend(_effect, options);
    // _effect.onStop= options.onStop
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
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
        if (!isReadonly) {
            track(obj, key);
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

class refImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        // value -> reactive
        // 1. 看看value 是不是对象
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // hasChanged
        if (hasChanged(newValue, this._rawValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffect(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new refImpl(value);
}
function isRef(value) {
    return !!value.__v_isRef;
}
function unRef(value) {
    if (isRef(value)) {
        return value.value;
    }
    else {
        return value;
    }
}
function proxyRefs(obj) {
    return new Proxy(obj, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
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
        isMounted: false, // 是否是初始化
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
        insetance.setupState = proxyRefs(setupResult);
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
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMMPONENT */) {
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
            }
            else {
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
    function processElement(n1, n2, container, parentComponent) {
        // init -updata
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
    }
    const EMPTY_OBJ = {};
    function patchProps(el, oldProps, newProps) {
        console.log(oldProps, newProps, 'oldProps, newProps');
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
    function mountElement(n2, container, parentComponent) {
        // const vnode = {
        //   type,
        //   props,
        //   children,
        // };
        const el = (n2.el = createElement(n2.type));
        // string array
        const { children, props, shapeFlag } = n2;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILREN */) {
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

function createElement(type) {
    return document.createElement(type);
}
function hostPatchProps(el, key, preVal, nextval) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextval);
    }
    if (nextval === null || nextval === undefined) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, nextval);
    }
}
function insert(el, parent) {
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    hostPatchProps,
    insert,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createVnodeText, getCurrentInstance, h, inject, provide, proxyRefs, reactive, ref, renderSlots };
//# sourceMappingURL=guide-mini-vue.esm.js.map
