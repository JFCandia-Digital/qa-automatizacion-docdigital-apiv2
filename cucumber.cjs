module.exports = {
  default: {
    paths: ["src/api-test/**/features/*.feature"],
    require: [
      "src/common/hooks/hooks.ts",
      "src/api-test/**/steps/*.steps.ts",
    ],
    requireModule: ["ts-node/register"],
    formatOptions: { snippetInterface: "async-await" },
    format: ["progress-bar", "summary", ["html", "reports/report.html"]],
  },
};