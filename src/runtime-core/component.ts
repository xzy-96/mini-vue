export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type:vnode.type
  }
  return component
}

export function setupComponent(insetance) {
  // initProps()
  // initSlots()

  setupStatefulCopmonent(insetance)
}

function setupStatefulCopmonent(insetance: any) {
  const Compontent = insetance.type
  const {setup} = Compontent
  if(setup) {
    const setupResult = setup()
    handleSetupResult(insetance,setupResult)
  }
  
}
function handleSetupResult(insetance,setupResult: any) {
  if(typeof setupResult === 'object'){
    insetance.setupState = setupResult
  }
  finishComponentSetup(insetance)
}


function finishComponentSetup(insetance: any) {
   const Compontent = insetance.type
   if(!Compontent.render) {
    insetance.render = Compontent.render
   }
}

