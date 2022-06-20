import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandles } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
    slots: {},
  };
  // 需要获取到 props
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(insetance) {
  initProps(insetance, insetance.vnode.props);
  initSlots(insetance, insetance.vnode.children);

  setupStatefulCopmonent(insetance);
}

function setupStatefulCopmonent(insetance: any) {
  const Compontent = insetance.type;

  insetance.proxy = new Proxy({ _: insetance }, PublicInstanceProxyHandles);
  const { setup } = Compontent;
  if (setup) {
    const setupResult = setup(shallowReadonly(insetance.props), {
      emit: insetance.emit,
    });
    handleSetupResult(insetance, setupResult);
  }
}
function handleSetupResult(insetance, setupResult: any) {
  if (typeof setupResult === "object") {
    insetance.setupState = setupResult;
  }
  finishComponentSetup(insetance);
}

function finishComponentSetup(insetance: any) {
  const Compontent = insetance.type;
  if (Compontent.render) {
    insetance.render = Compontent.render;
  }
}
