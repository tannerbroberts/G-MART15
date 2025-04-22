module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow files longer than 30 lines of code",
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const sourceCode = context.getSourceCode();
        const lines = sourceCode.lines.filter(line => line.trim() !== "");
        if (lines.length > 30) {
          context.report({
            node,
            message: `File has ${lines.length} lines, which exceeds the maximum of 30.`,
          });
        }
      },
    };
  },
};
