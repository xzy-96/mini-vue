const isObject = val => val !== null && typeof val === 'object';

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(insetance) {
    // initProps()
    // initSlots()
    setupStatefulCopmonent(insetance);
}
function setupStatefulCopmonent(insetance) {
    const Compontent = insetance.type;
    const { setup } = Compontent;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(insetance, setupResult);
    }
}
function handleSetupResult(insetance, setupResult) {
    if (typeof setupResult === 'object') {
        insetance.setupState = setupResult;
    }
    finishComponentSetup(insetance);
}
function finishComponentSetup(insetance) {
    const Compontent = insetance.type;
    if (!Compontent.render) {
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
    console.log(vnode.type);
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
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
    const el = document.createElement(vnode.type);
    // string array
    const { children, props } = vnode;
    if (!Array.isArray(children)) {
        el.textContent = children;
    }
    else {
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

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
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
