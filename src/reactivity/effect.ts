let activeEffect
class ReactiveEffect{
  private _fn
  constructor(fn) {
    this._fn = fn
  } 
  run() {
    activeEffect = this
    return this._fn()
  }
}
let targetMap =  new Map();
export function track(target,key) {
  // 收集fn fn不能重复 所以用 set
  // target >key > dep

  let depsMap = targetMap.get(target)
  if(!depsMap) {
    depsMap = new Map()
    targetMap.set(target,depsMap)
  }

  let dep = depsMap.get(key)
  if(!dep) {
    dep = new Set()
  }
  dep.add(activeEffect)
  // all.set(key,obj)
    // 把值存起来
}

export function trigger(target,key) {
  console.log(targetMap,'targe')
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  if(!dep){
    return
  }
  for(let effect of dep) {
    effect.run()
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
  return _effect.run.bind(_effect)

}