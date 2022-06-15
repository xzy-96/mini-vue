export const enum ShapeFlags{
  ELEMENT=1,  // 0001
  STATEFUL_COMMPONENT= 1<<1, // 0010
  TEXT_CHILREN= 1<<2, // 0100
  ARRAY_CHILREN= 1<<3, // 1000
}