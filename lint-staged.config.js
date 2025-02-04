export default {
  // Lint then format TypeScript and JavaScript files
  "./src/**/*.(ts|tsx|js|jsx|mjs)": (filenames) => [
    `npx eslint --fix ${filenames.join(" ")}`,
    `npx prettier --write ${filenames.join(" ")}`,
  ],

  // Format MarkDown
  "**/*.md,": (filenames) => `npx prettier --write ${filenames.join(" ")}`,

  // Format JSON
  "./src/**/*.json,": (filenames) =>
    `npx prettier --write ${filenames.join(" ")}`,
};
