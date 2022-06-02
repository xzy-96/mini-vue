import { track,trigger } from "./effect"

export function reactive(raw) {
  return new Proxy(raw,{
    // obj是对象 
    get(obj, key){
      const res = Reflect.get(obj,key)

      // 收集依赖 TODO
      track(obj,key)
      return res
    },
    set(obj, key, value) {
      const res = Reflect.set(obj,key,value)
      trigger(obj,key)
    // 表示成功
      return res;
    }
  })
}