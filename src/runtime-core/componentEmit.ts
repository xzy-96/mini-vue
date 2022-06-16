import { camelize, toHandlerKey } from "../shared";

export const emit = (instance, event: string, ...ary) => {
  // 找到 instance上的props
  const { props } = instance;
  const handleName = toHandlerKey(camelize(event));
  const handler = props[handleName];
  handler && handler(...ary);
};
