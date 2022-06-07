import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffect } from "./effect"
import { reactive } from "./reactive"

class refImpl {
  private _value:any
  public dep
  private _rawValue: any
  private __v_isRef = true
  constructor(value) {
    this._rawValue = value
    this._value = convert(value) 
    // value -> reactive
    // 1. 看看value 是不是对象
    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    // hasChanged
    if(hasChanged(newValue,this._rawValue)) {
      this._value = convert(newValue)  
      this._rawValue = newValue
      triggerEffect(this.dep)
    }
    
    
  }
}
function convert(value) {
 return isObject(value) ? reactive(value) : value
}
function  trackRefValue(ref) {
  if(isTracking()) {
    trackEffects(ref.dep)
  }
}
export function ref(value) {
  return new refImpl(value)
}

export function isRef(value) {
  return !!value.__v_isRef
}

export function unRef(value) {
  if(isRef(value)) {
  return  value.value
  }else{
    return value
  }
}


