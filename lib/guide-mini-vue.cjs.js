'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const quese = [];
let isFlushPending = false;
function queueJops(job) {
    if (!quese.includes(job)) {
        quese.push(job);
    }
    console.log(quese, "console.log(job, quese);");
    queseFlush();
}
function queseFlush() {
    if (isFlushPending)
        return true;
    isFlushPending = true;
    nextTick(flushJob);
}
function flushJob() {
    let job;
    isFlushPending = false;
    while ((job = quese.shift())) {
        console.log(job, quese);
        job && job();
    }
}
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}

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
    $props: (i) => i.props,
};
const PublicInstanceProxyHandles = {
    get({ _: insetance }, key) {
        // debugger;
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
        next: null,
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
        component: null,
        key: props === null || props === void 0 ? void 0 : props.key,
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

function shouldUpdataComponent(prevVnode, nextVNode) {
    const { props: prevProps } = prevVnode;
    const { props: nextProps } = nextVNode;
    for (let key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
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
    const { hostPatchProps, insert: hostInsert, createElement: hostCreateElement, remove: hostRemove, setElementText: hostSetElementText, } = options;
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
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMMPONENT */) {
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
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor); // 初始化
        }
        else {
            updataComponent(n1, n2); // 更新组件
        }
    }
    function updataComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdataComponent(n1, n2)) {
            console.log(n1, n2, "组件更新");
            instance.next = n2;
            instance.update();
        }
        else {
            instance.el = n1.el;
            instance.vnode = n2;
        }
    }
    function mountComponent(initialVnode, container, parentComponent, anchor) {
        const instance = (initialVnode.component = createComponentInstance(initialVnode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, initialVnode, container, anchor);
    }
    function setupRenderEffect(instance, initialVnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy)); // 存起来初始化的 虚拟DOM 更新的时候作对比
                console.log(subTree, "subTree");
                patch(null, subTree, container, instance, anchor);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新
                const { proxy, next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updataComponentPreRender(instance, next);
                }
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree; // 更新之后 他就是 上一个虚拟节点了
                console.log(subTree, "subTree");
                console.log("updata", preSubTree);
                patch(preSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                console.log(111);
                queueJops(instance.update);
            },
        });
    }
    function updataComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode;
        instance.next = null;
        instance.props = nextVNode.props;
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        // init -updata
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
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
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILREN */) {
            // 判断新的节点是否是text
            if (prevShapeFlags & 8 /* ShapeFlags.ARRAY_CHILREN */) {
                // 1.把老的清空
                unmountChildren(n1.children);
            }
            // 2. 设置text
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlags & 4 /* ShapeFlags.TEXT_CHILREN */) {
                // 判断老的节点是否是text 新的必定是 arr
                // 清空
                hostSetElementText(container, "");
                mountChilren(c2, container, parentComponent, anchor);
            }
            else {
                // arr -> arr diff
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        let i = 0, l2 = c2.length, e1 = c1.length - 1, e2 = l2 - 1;
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
            }
            else {
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
            }
            else {
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
            }
            else if (i > e2) {
                // 当新的比老的少时 删除 abc => ab
                while (i <= e1) {
                    hostRemove(c1[i].el);
                    i++;
                }
            }
        }
        else {
            // 中间对比
            let s1 = i; // 老节点的开始
            let s2 = i; // 新的节点
            const toBePatched = e2 - s2 + 1; // 要遍历的数量
            let patched = 0; // 已经patch
            const newIndexToOldIndexMap = new Array(toBePatched);
            const keyToNewIndexMap = new Map();
            let maxNewIndexSoFar = 0;
            for (let i = 0; i < toBePatched; i++)
                newIndexToOldIndexMap[i] = 0;
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
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prveChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prveChild.el);
                }
                else {
                    // hostSetElementText()
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
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
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
        // unmountChildren(c1.slice(i));
        // mountChilren(c2.slice(i), container, parentComponent);
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
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILREN */) {
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
                }
                else {
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
const renderer = createRenderer({
    createElement,
    hostPatchProps,
    insert,
    remove,
    setElementText,
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
exports.nextTick = nextTick;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.ref = ref;
exports.renderSlots = renderSlots;
//# sourceMappingURL=guide-mini-vue.cjs.js.map
