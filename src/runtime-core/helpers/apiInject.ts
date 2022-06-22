import { getCurrentInstance } from "../component";

export function inject(key, val) {
  const currentInstance: any = getCurrentInstance();
  const prarentProvides = currentInstance.parent.provides;
  if (key in prarentProvides) {
    return prarentProvides[key];
  } else {
    return val;
  }
}

export function provide(key, value) {
  // 存
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides =
      currentInstance.parent && currentInstance.parent.provides;
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }

    provides[key] = value;
  }
}
