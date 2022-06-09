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
    // patch
    patch(vnode);
}
function patch(vnode, container) {
    // 去处理 组件
    processComponent(vnode);
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

function createVNode(type, props, children) {
    const vnode = {
        type, props, children
    };
    return vnode;
}

function createApp(rootCommponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootCommponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
//# sourceMappingURL=guide-mini-vue.esm.js.map
