export const extend = Object.assign;

export const isObject = (val) => val !== null && typeof val === "object";

export const hasChanged = (val, newVal) => !Object.is(val, newVal);

export const hasOwn = (target, key) => Reflect.has(target, key);

// add -> Add
export const capitalize = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
};
// add-todo -> addTodo
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
