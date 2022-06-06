import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true,true)
function createGetter(isReadonly= false,isShallow=false) {
  return function get(obj, key) {
    if(key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }else if(key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
     const res = Reflect.get(obj,key)
     // 看看res 是不是 object
     if(isShallow){
       return res
     }
     if(isObject(res)) {
       return isReadonly? readonly(res) : reactive(res)
     }
     if(!isReadonly) {
       track(obj,key)
     }
     return res
   }
 }
 
 function createSetter() {
   return function set(obj,key,value) {
     const res = Reflect.set(obj,key,value)
     // 触发依赖
     trigger(obj,key)
   // 表示成功
     return res;
   }
 }
 export const mutableHandlers = {
  get,
  set
}

export const readonlyhandlers = {
  get:readonlyGet,
  set(obj, key, value) {
    return true
  }
}
export const shallowhandlers = extend({},readonlyhandlers,{
  get:shallowReadonlyGet
}) 