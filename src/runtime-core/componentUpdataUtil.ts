export function shouldUpdataComponent(prevVnode, nextVNode) {
  const { props: prevProps } = prevVnode;
  const { props: nextProps } = nextVNode;
  for (let key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
