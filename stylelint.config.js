export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: [
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "**/playwright-report/**",
    "**/test-results/**",
  ],
  overrides: [
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss",
      extends: ["stylelint-config-standard-scss"],
    },
  ],
};
