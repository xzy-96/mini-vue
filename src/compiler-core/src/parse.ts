import { NodeTypes } from "./ast";
const enum TagType {
  START,
  END,
}
export function baseParse(content: string) {
  const context = createParseContext(content);

  return crerateRoot(parseChildren(context));
}
function parseChildren(context) {
  const nodes: any = [];
  let node;
  const s = context.source;
  if (s.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (s[0] === "<") {
    // 是否是 <div></div>
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }

  nodes.push(node);
  return nodes;
}

function parseElement(context) {
  const element = parseTag(context, TagType.START);
  parseTag(context, TagType.END);
  return element;
}
function parseTag(context, type: TagType) {
  // 1.解析tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  console.log(match, "match");
  const tag = match[1];
  // 删除
  advanceBy(context, match[0].length + 1);

  console.log(context, "context");
  if (type === TagType.END) return;
  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  };
}
function parseInterpolation(context) {
  // {{message}}

  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  // 获取 }} 的下标
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );
  // 移动下标{{
  advanceBy(context, openDelimiter.length);
  // context.source = context.source.slice(openDelimiter.length);
  console.log(context.source, "context.source ");
  const rawContentLength = closeIndex - closeDelimiter.length;
  // 提取值出来  {{值}}
  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();
  // 后面可能还有值
  // context.source = context.source.slice(
  //   rawContentLength + closeDelimiter.length
  // );
  advanceBy(context, rawContentLength + closeDelimiter.length);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content + context.source,
    },
  };
}

function advanceBy(context, length: number) {
  context.source = context.source.slice(length);
}
function crerateRoot(children) {
  return {
    children,
  };
}
function createParseContext(content: string): any {
  return {
    source: content,
  };
}
