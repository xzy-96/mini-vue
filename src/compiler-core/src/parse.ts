export function baseParse(str: string) {
  return {
    children: [
      {
        type: "interpolation",
        conttent: {
          type: "simple_expression",
          content: "message",
        },
      },
    ],
  };
}
