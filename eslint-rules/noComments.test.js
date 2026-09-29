import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { noComments } from "./noComments.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  linterOptions: {
    noInlineConfig: true,
    reportUnusedDisableDirectives: "off",
  },
});

const commentError = { messageId: "comment" };

const ignoredDirective = (directive) => ({
  message: `'${directive}' has no effect because you have 'noInlineConfig' setting in your config.`,
});

ruleTester.run("no-comments", noComments, {
  valid: [
    "const total = 1 + 2;",
    'const url = "https://example.com/path/*";',
    "const pattern = /\\/\\//;",
    "const template = `/* not a comment */ // neither`;",
    'const element = <a href="https://example.com">link</a>;',
  ],
  invalid: [
    { code: "// line comment\nconst a = 1;", errors: [commentError] },
    { code: "const a = 1; /* block comment */", errors: [commentError] },
    { code: "/** jsdoc */\nfunction run() {}", errors: [commentError] },
    { code: "const element = <div>{/* jsx comment */}</div>;", errors: [commentError] },
    {
      code: "// eslint-disable-next-line no-undef\nconst a = 1;",
      errors: [ignoredDirective("// eslint-disable-next-line no-undef"), commentError],
    },
    {
      code: "/* eslint-disable */\nconst a = 1;",
      errors: [ignoredDirective("/* eslint-disable */"), commentError],
    },
    { code: "// @ts-expect-error\nconst a: number = 'x';", errors: [commentError] },
    { code: "// @ts-ignore\nconst a = 1;", errors: [commentError] },
    { code: "// first\n// second\nconst a = 1;", errors: [commentError, commentError] },
  ],
});
